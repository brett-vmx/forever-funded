-- Lets the (unauthenticated) client check whether an email has a real account
-- before sending a magic link, so the login flow can refuse instead of silently
-- auto-creating a new account for a stranger email.
-- Applied live via Supabase MCP on 2026-07-23; recorded here for parity.
--
-- security definer + explicit search_path so it can read auth.users (not
-- otherwise visible to anon), returning only a boolean, never any user data.

BEGIN;

create or replace function public.email_has_account(p_email text)
returns boolean
language sql
stable
security definer
set search_path = auth, public
as $$
  select exists (
    select 1 from auth.users where lower(email) = lower(p_email)
  );
$$;

grant execute on function public.email_has_account(text) to anon, authenticated;

COMMIT;
