CREATE TABLE public.user_customizations (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

alter table public.user_customizations enable row level security;

create policy "users can view own customizations"
on public.user_customizations
for select
using (
    auth.uid() = user_id
);

create policy "users can insert own customizations"
on public.user_customizations
for insert
with check (
    auth.uid() = user_id
);

create policy "users can update own customizations"
on public.user_customizations
for update
using (
    auth.uid() = user_id
)
with check (
    auth.uid() = user_id
);

create policy "users can delete own customizations"
on public.user_customizations
for delete
using (
    auth.uid() = user_id
);
