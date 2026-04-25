create table public.companies (
  user_id uuid primary key references auth.users(id) on delete cascade,
  identities text[] not null default '{}',
  egos text[] not null default '{}',
  updated_at timestamptz default now()
);

create or replace function public.get_company_by_username(p_username text)
returns table (
  user_id uuid,
  identities text[],
  egos text[],
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    c.user_id,
    c.identities,
    c.egos,
    c.updated_at
  from public.companies c
  join public.users u on c.user_id = u.id
  where u.username = p_username
  limit 1;
$$;

alter table public.companies enable row level security;

create policy "Anyone can read user companies"
on public.companies
for select
using (true);

create policy "Users can insert their own company"
on public.companies
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own company"
on public.companies
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);