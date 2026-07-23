-- Declared profile fields for the /profile page (Tier 2), plus a safe scoped
-- update path. Applied live via Supabase MCP on 2026-07-23; recorded here for
-- parity.
--
-- Security note: profiles deliberately has NO general UPDATE policy (a direct
-- client update could set reviews_limit to 9,999). Instead of adding one, we
-- expose a security-definer RPC that updates ONLY the declared fields for
-- auth.uid(). The quota columns (tier, reviews_limit, reviews_used,
-- access_expires_at) are never referenced by the function, so they remain
-- impossible to change from the client.

BEGIN;

-- All optional/nullable. Length caps bound abuse and, for coach_instructions,
-- bound token cost when it's later fed to the Coach (Part C, not built yet).
alter table public.profiles
  add column if not exists first_name         text,
  add column if not exists last_name          text,
  add column if not exists country            text,
  add column if not exists ministry_title     text,
  add column if not exists organization_name  text,
  add column if not exists coach_instructions text;

alter table public.profiles
  add constraint profiles_first_name_len  check (char_length(first_name)         <= 100),
  add constraint profiles_last_name_len   check (char_length(last_name)          <= 100),
  add constraint profiles_country_len     check (char_length(country)            <= 100),
  add constraint profiles_title_len       check (char_length(ministry_title)     <= 120),
  add constraint profiles_org_len         check (char_length(organization_name)  <= 150),
  add constraint profiles_coach_instr_len check (char_length(coach_instructions) <= 1000);

create or replace function public.update_own_profile(
  p_first_name        text,
  p_last_name         text,
  p_country           text,
  p_ministry_title    text,
  p_organization_name text,
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
      country            = p_country,
      ministry_title     = p_ministry_title,
      organization_name  = p_organization_name,
      coach_instructions = p_coach_instructions,
      updated_at         = now()
  where id = auth.uid();
end;
$$;

grant execute on function public.update_own_profile(
  text, text, text, text, text, text
) to authenticated;

COMMIT;
