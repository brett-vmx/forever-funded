BEGIN;

create table public.review_messages (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references public.reviews(id)  on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);
create index review_messages_review_id_idx on public.review_messages(review_id);

alter table public.review_messages enable row level security;

-- Read own only. All writes happen server-side via the service role (matches the
-- existing reviews pattern), so no insert policy for clients.
create policy "review_messages_select_own"
  on public.review_messages for select
  using (auth.uid() = user_id);

grant select on public.review_messages to authenticated;

COMMIT;
