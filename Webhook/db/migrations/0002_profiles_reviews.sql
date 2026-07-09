-- =========================================================
-- Forever Funded — core schema (v2)
-- Source: supabase-build-spec.md (authored via Claude Chat), with launch
-- edits (invite codes removed; single 10-credit / 90-day launch default).
--
-- ⚠️ THIS IS A v2 REDESIGN, NOT AN ADDITION TO THE LIVE SCHEMA.
-- The currently-deployed Worker uses the tables in db/schema.sql
-- (subscribers / submissions / reports). This migration introduces a
-- DIFFERENT, Supabase-Auth-based model (profiles / reviews) that the current
-- Worker does NOT read or write. Applying this alone does not change how the
-- live product behaves — see the "Sequencing" note Brett and Claude Code
-- discussed before running it.
-- =========================================================

-- ---------- Enums ----------
-- tier/pilot/paid kept as-is for future use even though invite codes are gone;
-- `tier` encodes the access type, and access_expires_at governs when it ends.
create type plan_tier as enum ('trial', 'pilot', 'paid');
create type review_status as enum ('received', 'processing', 'completed', 'failed');

-- ---------- profiles ----------
-- One row per auth user. Holds the review address + plan/quota.
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text,
  review_slug       text not null unique,
  tier              plan_tier not null default 'trial',
  reviews_limit     int not null default 10,          -- launch default; keep in sync with handle_new_user() LAUNCH TERMS
  access_expires_at timestamptz,                       -- set at signup by the trigger; see comment below
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on column public.profiles.access_expires_at is
  'when this account''s access ends; null = no limit. Set at signup to now()+90 days for the launch window.';

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

-- Postmark retries a send that didn't get a 2xx response. Without this
-- constraint, a retried delivery for the same inbound message would insert a
-- second reviews row and silently burn a second credit off the same letter.
-- A partial unique index (not a plain unique column) because
-- postmark_message_id is only ever set on Postmark-sourced reviews — this
-- must never block multiple NULLs from any other insert path.
create unique index reviews_postmark_message_id_key
  on public.reviews (postmark_message_id)
  where postmark_message_id is not null;

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
    -- 'ffcoach' brand prefix + 8 random lowercase hex chars (see 0004).
    candidate := 'ffcoach' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
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
declare
  -- ============================================================
  -- LAUNCH TERMS — the ONE place to change access rules.
  -- After the conference, edit these two lines and re-run this
  -- CREATE OR REPLACE. (Also keep the reviews_limit column default,
  -- above, in sync with launch_reviews.)
  -- ============================================================
  launch_reviews constant int      := 10;                 -- review credits per person
  launch_window  constant interval := interval '90 days'; -- access window per person
begin
  insert into public.profiles (id, email, review_slug, reviews_limit, access_expires_at)
  values (
    new.id,
    new.email,
    public.generate_review_slug(),
    launch_reviews,
    now() + launch_window
  );
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
    return false;                       -- launch window closed
  end if;
  return public.remaining_reviews(p_user_id) > 0;
end;
$$;

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.profiles enable row level security;
alter table public.reviews  enable row level security;

-- profiles: read own only. NO direct update (prevents self-upgrade of limit/expiry).
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- reviews: read own only. All writes happen server-side via service role.
create policy "reviews_select_own"
  on public.reviews for select
  using (auth.uid() = user_id);

-- Function grants
grant execute on function public.remaining_reviews(uuid)  to authenticated;
grant execute on function public.can_request_review(uuid) to authenticated;
