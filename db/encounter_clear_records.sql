create table public.encounter_clear_records (
  id uuid primary key default gen_random_uuid(),

  encounter_id uuid not null references public.encounters(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,

  turn_count integer not null check (turn_count > 0),
  difficulty text,

  team_data jsonb not null default '{}'::jsonb,

  video_url text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index encounter_clear_records_encounter_idx
  on public.encounter_clear_records (encounter_id)
  where deleted_at is null;

create index encounter_clear_records_user_idx
  on public.encounter_clear_records (user_id)
  where deleted_at is null;

create index encounter_clear_records_encounter_user_idx
  on public.encounter_clear_records (encounter_id, user_id)
  where deleted_at is null;

create index encounter_clear_records_leaderboard_idx
  on public.encounter_clear_records (encounter_id, turn_count, created_at)
  where deleted_at is null;

create or replace function public.set_encounter_clear_record_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger encounter_clear_records_updated_at
before update on public.encounter_clear_records
for each row
execute function public.set_encounter_clear_record_updated_at();

alter table public.encounter_clear_records
enable row level security;

create policy "clear records are viewable"
on public.encounter_clear_records
for select
using (deleted_at is null);

create policy "users can create own clear records"
on public.encounter_clear_records
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update own clear records"
on public.encounter_clear_records
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can delete own clear records"
on public.encounter_clear_records
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.create_encounter_clear_record(
  p_encounter_id uuid,
  p_turn_count integer,
  p_difficulty text,
  p_team_data jsonb,
  p_video_url text default null,
  p_notes text default null,
  p_image_ids uuid[] default '{}'
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_record_id uuid;
begin
  insert into public.encounter_clear_records (
    encounter_id,
    user_id,
    turn_count,
    difficulty,
    team_data,
    video_url,
    notes
  )
  values (
    p_encounter_id,
    auth.uid(),
    p_turn_count,
    p_difficulty,
    p_team_data,
    p_video_url,
    p_notes
  )
  returning id into v_record_id;

  insert into public.images (id, created_at)
  select x.id, now()
  from unnest(p_image_ids) as x(id)
  on conflict (id) do nothing;

  insert into public.image_attachments (
    image_id,
    target_type,
    target_id,
    position
  )
  select
    unnest(p_image_ids),
    'encounter_clear_record'::target_type_enum,
    v_record_id,
    generate_subscripts(p_image_ids, 1) - 1;

  return v_record_id;
end;
$$;

create or replace function public.update_encounter_clear_record(
  p_id uuid,
  p_turn_count integer,
  p_difficulty text,
  p_team_data jsonb,
  p_video_url text,
  p_notes text,
  p_image_ids uuid[] default '{}'
)
returns void
language plpgsql
security definer
as $$
begin
  update public.encounter_clear_records
  set
    turn_count = p_turn_count,
    difficulty = p_difficulty,
    team_data = p_team_data,
    video_url = p_video_url,
    notes = p_notes
  where id = p_id
    and user_id = auth.uid()
    and deleted_at is null;

  if not found then
    raise exception 'Record not found';
  end if;

  insert into public.images (id, created_at)
  select x.id, now()
  from unnest(p_image_ids) as x(id)
  on conflict (id) do nothing;

  delete from public.image_attachments
  where target_type = 'encounter_clear_record'::target_type_enum
  and target_id = p_id;

  INSERT INTO public.image_attachments (
    image_id,
    target_type,
    target_id,
    position
  )
  SELECT
    x.image_id,
    'encounter_clear_record'::target_type_enum,
    p_id,
    x.ordinality - 1
    FROM unnest(p_image_ids) WITH ORDINALITY AS x(image_id, ordinality);
end;
$$;

create or replace function public.delete_encounter_clear_record(
  p_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  update public.encounter_clear_records
  set deleted_at = now()
  where id = p_id
    and user_id = auth.uid()
    and deleted_at is null;

  if not found then
    raise exception 'Record not found';
  end if;
end;
$$;

create or replace function public.get_encounter_clear_records(
  p_encounter_id uuid,
  p_user_id uuid default null,
  p_difficulty text default null,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  id uuid,
  encounter_id uuid,
  username text,
  turn_count integer,
  difficulty text,
  team_data jsonb,
  video_url text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz,
  image_ids uuid[]
)
language sql
stable
as $$
  select
    r.id,
    r.encounter_id,
    u.username,
    r.turn_count,
    r.difficulty,
    r.team_data,
    r.video_url,
    r.notes,
    r.created_at,
    r.updated_at,
    coalesce(
      array_agg(ia.image_id order by ia.position)
        filter (where ia.image_id is not null),
      '{}'::uuid[]
    ) as images

  from public.encounter_clear_records r
  left join public.image_attachments ia
    on ia.target_type = 'encounter_clear_record'::target_type_enum
   and ia.target_id = r.id
  left join public.users u on r.user_id = u.id

  where r.encounter_id = p_encounter_id
    and r.deleted_at is null
    and (p_user_id is null or r.user_id = p_user_id)
    and (p_difficulty is null or r.difficulty = p_difficulty)

  group by r.id, u.username
  order by r.turn_count asc, r.created_at asc
  limit p_limit
  offset p_offset;
$$;