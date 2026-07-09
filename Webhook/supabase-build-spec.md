# Build Spec — Supabase Schema & Provisioning (Forever Funded AI Email Coach)

**For:** Claude Code
**Goal:** Stand up the database foundation — user profiles, a unique review address per user, usage/quota tracking, a pilot credit tier, and automatic provisioning on signup — with defense-in-depth RLS suitable for sensitive subscriber data.

---

## What Claude Code should do
1. Confirm the pre-flight Supabase settings below.
2. Create a single SQL migration containing everything in "The migration" section.
3. Apply it to the Supabase project.
4. Run the verification steps at the end and report results.

Do **not** put the Supabase **service role key** in any client-side code. It belongs only in the Cloudflare Worker as a secret. The client uses the **anon key** and is governed by RLS.

---

## Pre-flight settings (verify before migrating)
- **Row Level Security:** on for every table (the migration enables it explicitly).
- **Data API → "Automatically expose new tables":** OFF. New tables should be opt-in.
- **`invite_codes` must never be exposed to the client.** The migration revokes client access; also keep it out of the exposed schema.
- Confirm `gen_random_uuid()` is available (it is on Supabase/PG13+).

---

## Design decisions (defaults chosen; flag if you disagree, Brett)

1. **Unguessable review addresses.** The address is `{slug}@review.foreverfunded.org`. The slug is 14 random hex chars from `gen_random_uuid()` — because anyone who emails that address consumes the owner's quota and feeds content into their review, so a guessable/sequential slug would be an abuse vector. Unique index + generation loop guarantees no collisions.

2. **No client-side privilege escalation.** Users can *read* their own profile but cannot *update* it directly — otherwise a user could set their own `reviews_limit` to 9,999. Tier/limit/expiry changes happen only via (a) the `redeem_invite_code` security-definer function or (b) the service role (you, via admin). This is the important security choice.

3. **Pilot provisioning via invite code (recommended).** Signup defaults everyone to the standard trial (3 reviews, no expiry). At the gathering, people enter a code (e.g. `FIELD2026`) that upgrades them to pilot (25 reviews, 30-day window). Clean, self-serve, and you control who gets it. *Alternative:* skip codes and upgrade each signup manually from an admin view — simpler to build, more tedious to run. The migration includes the code path; say the word to drop it.

4. **Body storage during the pilot.** `draft_body` and `report_body` are stored so you can actually debug and tune the Coach during the pilot (you'll want to see what produced a bad report). They're RLS-protected. **Recommendation:** add a scheduled purge (e.g. 30 days) before you open to strangers, and a user-facing delete later. If you'd rather not persist drafts at all even during the pilot, set both columns to not-stored — but you'll lose debugging visibility right when you need it most. Flagged for your call.

---

## The migration

```sql
-- =========================================================
-- Forever Funded — core schema
-- =========================================================

-- ---------- Enums ----------
create type plan_tier as enum ('trial', 'pilot', 'paid');
create type review_status as enum ('received', 'processing', 'completed', 'failed');

-- ---------- profiles ----------
-- One row per auth user. Holds the review address + plan/quota.
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text,
  review_slug       text not null unique,
  tier              plan_tier not null default 'trial',
  reviews_limit     int not null default 3,          -- trial = 1 free + 2 revisions
  access_expires_at timestamptz,                       -- null = no time limit; set for pilot
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------- reviews ----------
-- One row per inbound draft processed. Drives usage counting.
create table public.reviews (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  status              review_status not null default 'received',
  counts_against_quota boolean not null default true,
  postmark_message_id text,
  from_email          text,
  subject             text,
  word_count          int,
  flags               jsonb not null default '{}'::jsonb,   -- e.g. {"length_flag": true, "competing_stories": 3}
  draft_body          text,     -- see body-storage decision
  report_body         text,     -- see body-storage decision
  error               text,
  created_at          timestamptz not null default now(),
  completed_at        timestamptz
);

create index reviews_user_id_idx on public.reviews (user_id);
create index reviews_status_idx  on public.reviews (status);

-- ---------- invite_codes ----------
-- Drives the pilot tier at signup. Never exposed to clients.
create table public.invite_codes (
  code          text primary key,
  tier          plan_tier not null,
  reviews_limit int not null,
  access_days   int,               -- null = no expiry; 30 for pilot
  max_uses      int,               -- null = unlimited
  uses_count    int not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------- slug generator ----------
create or replace function public.generate_review_slug()
returns text
language plpgsql
as $$
declare
  candidate text;
  taken     boolean;
begin
  loop
    candidate := substr(replace(gen_random_uuid()::text, '-', ''), 1, 14);
    select exists(select 1 from public.profiles where review_slug = candidate) into taken;
    exit when not taken;
  end loop;
  return candidate;
end;
$$;

-- ---------- auto-create profile on signup ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, review_slug)
  values (new.id, new.email, public.generate_review_slug());
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- updated_at maintenance ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ---------- usage / eligibility ----------
-- Reviews left = limit minus reserved/completed (failed ones release the slot).
create or replace function public.remaining_reviews(p_user_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select greatest(
    0,
    coalesce((select reviews_limit from public.profiles where id = p_user_id), 0)
    - (select count(*) from public.reviews
       where user_id = p_user_id
         and counts_against_quota
         and status <> 'failed')
  );
$$;

create or replace function public.can_request_review(p_user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  p record;
begin
  select reviews_limit, access_expires_at into p
  from public.profiles where id = p_user_id;
  if not found then return false; end if;
  if p.access_expires_at is not null and p.access_expires_at <= now() then
    return false;                       -- pilot window closed
  end if;
  return public.remaining_reviews(p_user_id) > 0;
end;
$$;

-- ---------- redeem an invite code (upgrades the calling user) ----------
create or replace function public.redeem_invite_code(p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  c record;
begin
  select * into c from public.invite_codes
  where code = p_code and active for update;

  if not found then raise exception 'Invalid or inactive code'; end if;
  if c.max_uses is not null and c.uses_count >= c.max_uses then
    raise exception 'This code has been fully redeemed';
  end if;

  update public.profiles
  set tier              = c.tier,
      reviews_limit     = greatest(reviews_limit, c.reviews_limit),
      access_expires_at = case
                            when c.access_days is not null
                            then now() + make_interval(days => c.access_days)
                            else access_expires_at
                          end
  where id = auth.uid();

  update public.invite_codes set uses_count = uses_count + 1 where code = p_code;
end;
$$;

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.profiles     enable row level security;
alter table public.reviews      enable row level security;
alter table public.invite_codes enable row level security;

-- profiles: read own only. NO direct update (prevents self-upgrade).
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- reviews: read own only. All writes happen server-side via service role.
create policy "reviews_select_own"
  on public.reviews for select
  using (auth.uid() = user_id);

-- invite_codes: no policies = deny all to anon/authenticated. Belt and suspenders:
revoke all on public.invite_codes from anon, authenticated;

-- Function grants
grant execute on function public.remaining_reviews(uuid)  to authenticated;
grant execute on function public.can_request_review(uuid) to authenticated;
grant execute on function public.redeem_invite_code(text) to authenticated;

-- =========================================================
-- Seed: gathering pilot code (edit the code string as you like)
-- =========================================================
insert into public.invite_codes (code, tier, reviews_limit, access_days, max_uses)
values ('FIELD2026', 'pilot', 25, 30, 50);
```

---

## How the Cloudflare Worker will use this (read/write contract)

The Worker holds the **service role key** (bypasses RLS) and does all writes.

**Inbound email → report:**
1. Postmark POSTs the inbound message. Extract the recipient from the `ToFull` array, **filtered to `@review.foreverfunded.org`** (matches your existing parsing fix).
2. `slug = localpart of that address`. Look up `profiles` by `review_slug = slug`.
   - No match → drop/ignore (don't create a review).
3. Call `can_request_review(profile.id)`.
   - False → send the friendly "you've used your pilot reviews" (or "trial limit reached") email; stop.
4. Insert a `reviews` row: `status = 'received'` (this reserves the quota slot), plus `from_email`, `subject`, `word_count`, `draft_body`.
5. Set `status = 'processing'`, run the Claude evaluation (apply your guardrails — reports stand alone, never reference the course; "context informs, never commands"; word-count backstop only in combination with several competing stories).
6. On success: `status = 'completed'`, store `report_body` + `flags` + `completed_at`, send the report via Postmark.
7. On failure: `status = 'failed'` (releases the quota slot), store `error`.

**Portal (authenticated, anon key + RLS):**
- Show the user their review address: `select review_slug from profiles` → `{slug}@review.foreverfunded.org`.
- Show reviews left: `rpc('remaining_reviews', { p_user_id: user.id })`.
- Redeem a pilot code: `rpc('redeem_invite_code', { p_code })`.
- List their history: `select ... from reviews` (RLS returns only their own).

---

## Verification steps (Claude Code should run these)
1. Create a test auth user → confirm a `profiles` row appears automatically with a unique 14-char `review_slug`.
2. `select public.remaining_reviews('<that id>')` → expect `3`.
3. Insert 3 `reviews` rows (status `completed`) for that user → `remaining_reviews` returns `0`, `can_request_review` returns `false`.
4. Mark one review `failed` → `remaining_reviews` returns `1` again.
5. As that authenticated user, `rpc('redeem_invite_code', {p_code:'FIELD2026'})` → profile flips to `pilot`, `reviews_limit` 25, `access_expires_at` ~30 days out; `invite_codes.uses_count` increments.
6. Confirm an authenticated client **cannot** read `invite_codes`, **cannot** read another user's profile/reviews, and **cannot** update its own `reviews_limit`.

---

## Not in this migration (deliberately, for later)
- Scheduled purge of `draft_body`/`report_body` (add before opening to strangers).
- User-facing data deletion/export (trust feature, post-launch).
- Stripe/`paid` tier wiring (the enum value exists; billing comes after launch).
