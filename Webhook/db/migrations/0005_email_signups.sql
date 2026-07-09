-- Forever Funded — email capture signups
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
--
-- Backs the two "notify me" / "get updates" forms on the marketing site
-- (Website/src/components/ui/EmailCapture.tsx): the Course "Get notified"
-- card and the footer "Get updates" newsletter form. Distinct from
-- `subscribers` (db/schema.sql), which is the real Email Coach account
-- record — this table is just a pre-launch interest list.

create table if not exists public.email_signups (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  -- Which form captured this signup, so Course interest and newsletter
  -- interest can be queried/exported separately.
  source     text not null check (source in ('course', 'newsletter')),
  created_at timestamptz not null default now(),

  -- Same person can appear once per source (e.g. signs up for both the
  -- Course waitlist and the newsletter), but not twice for the same one.
  unique (email, source)
);

create index if not exists idx_email_signups_source on public.email_signups(source);

alter table public.email_signups enable row level security;

-- Public site visitors can submit a signup, but never read, update, or
-- delete existing rows — this table has no "owner" auth relationship.
create policy "anon can insert email signups"
  on public.email_signups
  for insert
  to anon
  with check (true);

-- RLS policies alone aren't enough — Postgres also checks table-level
-- privileges first. Tables created via raw SQL (unlike ones made through
-- the dashboard UI) don't inherit the anon/authenticated grants, so this
-- must be explicit or every insert 401s with "permission denied".
grant insert on public.email_signups to anon;
grant insert on public.email_signups to authenticated;
