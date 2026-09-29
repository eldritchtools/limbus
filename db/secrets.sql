create table public.secrets (
    id text primary key,
    value text not null
);

alter table public.secrets enable row level security;

revoke all on public.secrets from anon, authenticated;