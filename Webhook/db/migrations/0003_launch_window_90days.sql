-- Bumps the launch access window from 30 days to 90 days for all NEW signups
-- going forward. Does not touch reviews_limit (still 10) or anything else.
-- Existing profiles are extended separately (via a data-only update, no DDL
-- needed for that part).

begin;

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

comment on column public.profiles.access_expires_at is
  'when this account''s access ends; null = no limit. Set at signup to now()+90 days for the launch window.';

commit;
