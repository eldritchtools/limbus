create table public.achievement_progress (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  season_key TEXT NOT NULL,
  progress JSONB NOT NULL DEFAULT '{}'::JSONB,
  additional_points INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

alter table public.achievement_progress
add constraint progress_is_object
check (jsonb_typeof(progress) = 'object');

alter table public.achievement_progress enable row level security;

create policy "Users can read own progress"
on public.achievement_progress
for select
using (auth.uid() = user_id);

create policy "Users can insert own progress"
on public.achievement_progress
for insert
with check (auth.uid() = user_id);

create policy "Users can update own progress"
on public.achievement_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

