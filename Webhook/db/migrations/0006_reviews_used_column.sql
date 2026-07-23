-- Denormalized, always-in-sync count of quota-counting reviews per profile.
-- Applied live via Supabase MCP on 2026-07-23; recorded here for parity.
--
-- Postgres has no ALTER TABLE ... ADD COLUMN ... AFTER; it always appends. To
-- see it visually between tier/reviews_limit, drag it in the Supabase Table
-- Editor (display-only, doesn't touch physical schema).

BEGIN;

alter table public.profiles
  add column if not exists reviews_used int not null default 0;

-- Backfill from existing reviews, matching remaining_reviews()'s definition:
-- quota-counting and not failed.
update public.profiles p
set reviews_used = coalesce((
  select count(*)
  from public.reviews r
  where r.user_id = p.id
    and r.counts_against_quota
    and r.status <> 'failed'
), 0);

-- Keep it in sync going forward without touching Worker code: any insert,
-- update (e.g. status -> failed releases a slot), or delete on reviews
-- recalculates the owning profile's count.
create or replace function public.sync_profile_reviews_used()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_user uuid;
begin
  affected_user := coalesce(new.user_id, old.user_id);
  update public.profiles
  set reviews_used = (
    select count(*)
    from public.reviews
    where user_id = affected_user
      and counts_against_quota
      and status <> 'failed'
  )
  where id = affected_user;
  return null;
end;
$$;

drop trigger if exists reviews_sync_profile_used on public.reviews;
create trigger reviews_sync_profile_used
after insert or update or delete on public.reviews
for each row execute function public.sync_profile_reviews_used();

COMMIT;
