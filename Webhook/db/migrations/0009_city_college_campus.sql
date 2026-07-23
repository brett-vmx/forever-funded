-- Add city + college_campus declared fields, replacing update_own_profile's
-- 6-arg signature with an 8-arg one that includes them.
-- Applied live via Supabase MCP on 2026-07-23; recorded here for parity.

BEGIN;

alter table public.profiles
  add column if not exists city           text,
  add column if not exists college_campus text;

alter table public.profiles
  add constraint profiles_city_len            check (char_length(city)           <= 100),
  add constraint profiles_college_campus_len  check (char_length(college_campus) <= 150);

-- Drop the old 6-arg signature so there's a single, unambiguous RPC rather
-- than two overloads.
drop function if exists public.update_own_profile(text, text, text, text, text, text);

create or replace function public.update_own_profile(
  p_first_name         text,
  p_last_name          text,
  p_city               text,
  p_country            text,
  p_ministry_title     text,
  p_organization_name  text,
  p_college_campus     text,
  p_coach_instructions text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set first_name         = p_first_name,
      last_name          = p_last_name,
      city               = p_city,
      country            = p_country,
      ministry_title     = p_ministry_title,
      organization_name  = p_organization_name,
      college_campus     = p_college_campus,
      coach_instructions = p_coach_instructions,
      updated_at         = now()
  where id = auth.uid();
end;
$$;

grant execute on function public.update_own_profile(
  text, text, text, text, text, text, text, text
) to authenticated;

COMMIT;
