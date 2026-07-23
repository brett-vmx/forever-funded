-- Capture first_name at signup, and a one-way "have they visited /profile
-- before" flag so the greeting can say "You're in" the first time and
-- "Welcome back" every time after.
-- Applied live via Supabase MCP on 2026-07-23; recorded here for parity.

BEGIN;

-- signInWithOtp's `data` option (client-set metadata) lands in
-- auth.users.raw_user_meta_data for a newly-created user. Pull it into the
-- profiles row the trigger already creates.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  launch_reviews constant int      := 10;
  launch_window  constant interval := interval '90 days';
begin
  insert into public.profiles (id, email, review_slug, reviews_limit, access_expires_at, first_name)
  values (
    new.id,
    new.email,
    public.generate_review_slug(),
    launch_reviews,
    now() + launch_window,
    nullif(trim(new.raw_user_meta_data->>'first_name'), '')
  );
  return new;
end;
$$;

-- Persisted, one-way flag rather than a timestamp heuristic (e.g. comparing
-- created_at to last_sign_in_at breaks if someone clicks the magic link
-- minutes after requesting it).
alter table public.profiles
  add column if not exists first_login_completed_at timestamptz;

create or replace function public.mark_profile_seen()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  was_first boolean := false;
begin
  update public.profiles
  set first_login_completed_at = now()
  where id = auth.uid()
    and first_login_completed_at is null;
  if found then
    was_first := true;
  end if;
  return was_first;
end;
$$;

grant execute on function public.mark_profile_seen() to authenticated;

COMMIT;
