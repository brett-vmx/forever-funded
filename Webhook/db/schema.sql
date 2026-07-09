-- Forever Funded Email Coach — initial schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- One row per paying/trial subscriber. This is the account record.
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),

  -- Their real, registered email — where reports get sent, and (later)
  -- what they'd log into a portal with. NEVER the sender of a submitted
  -- email, which is often an ESP platform address.
  email text unique not null,

  -- The localpart of their unique review address, e.g. '7k92mx' for
  -- 7k92mx@review.foreverfunded.org. This is how inbound mail gets
  -- matched back to an account.
  review_token text unique not null,

  status text not null default 'trial'
    check (status in ('trial', 'active', 'expired')),

  reviews_used int not null default 0,
  reviews_limit int not null default 3, -- "1 free email + 2 revisions"

  -- Declared: what the subscriber optionally tells the Coach about
  -- themselves (region, org, ministry, audience notes). Keep this
  -- non-identifying where possible; see framework doc's Data care note.
  declared_profile jsonb not null default '{}'::jsonb,

  -- Derived: what the Coach has learned across submissions (recurring
  -- strengths/growth areas, voice, open story/prayer threads). v1 of
  -- this function stores the latest report only — see README for the
  -- profile-synthesis TODO.
  derived_profile jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

-- One row per submitted draft.
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references subscribers(id) on delete cascade,

  raw_subject text,
  raw_text text,
  raw_html text,

  -- Anything the writer put above the '--- COACH CONTEXT ---' delimiter,
  -- or null if they didn't use one.
  context_note text,

  is_forwarded boolean not null default false,

  created_at timestamptz not null default now()
);

-- One row per report generated for a submission.
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,

  report_html text not null,
  report_text text not null,

  created_at timestamptz not null default now()
);

-- Helpful indexes for the lookups the webhook actually does.
create index if not exists idx_subscribers_review_token on subscribers(review_token);
create index if not exists idx_submissions_subscriber_id on submissions(subscriber_id);
create index if not exists idx_reports_submission_id on reports(submission_id);
