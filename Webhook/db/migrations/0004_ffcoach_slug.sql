-- Prettier review addresses for NEW signups: "ffcoach" + 8 random hex chars,
-- e.g. ffcoach3f9a2b1c@review.foreverfunded.org (was 14 bare random hex).
-- Recognizable prefix + still-random suffix (~4.3B combinations, fine for a
-- pilot — reports always go to the registered account email, so a guessed
-- address only risks quota/nuisance, not data). Existing slugs are untouched;
-- only future signups get the new format.

begin;

create or replace function public.generate_review_slug()
returns text
language plpgsql
as $$
declare
  candidate text;
  taken     boolean;
begin
  loop
    -- 'ffcoach' brand prefix + 8 random lowercase hex chars from a uuid.
    candidate := 'ffcoach' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
    select exists(select 1 from public.profiles where review_slug = candidate) into taken;
    exit when not taken;
  end loop;
  return candidate;
end;
$$;

commit;
