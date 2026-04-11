create table feedback (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  message text not null,
  created_at timestamp with time zone default now()
);

alter table feedback enable row level security;

create policy "Allow inserts"
on feedback
for insert
to anon, authenticated
with check (true);