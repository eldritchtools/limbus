create table polls (
  id bigserial primary key,

  question text not null,
  type text not null check (type in ('single', 'multi')),

  options text[] not null,
  votes int[] not null default '{}',
  total_votes int not null default 0,

  start_ts timestamptz not null,
  end_ts timestamptz,

  created_at timestamptz not null default now(),

  constraint options_votes_match
    check (array_length(options, 1) = array_length(votes, 1))
);

create index polls_start_ts_idx
on polls (start_ts desc);

create table poll_answers (
  user_id uuid primary key,
  poll_id bigint not null references polls(id),
  answer int not null
);

create or replace function get_current_poll()
returns polls
language sql
stable
as $$
  select *
  from polls
  where start_ts <= now()
    and (end_ts is null or end_ts > now())
  order by start_ts desc
  limit 1;
$$;

create or replace function create_poll(
  p_question text,
  p_type text,
  p_options text[],
  p_start_date date,
  p_start_time time default '05:00:00',
  p_tz text default 'Asia/Manila',
  p_end_ts timestamptz default null
)
returns bigint
language plpgsql
as $$
declare
  new_id bigint;
  start_ts timestamptz;
begin
  start_ts := timezone(p_tz, (p_start_date + p_start_time));

  insert into polls(question, type, options, votes, start_ts, end_ts)
  values (
    p_question,
    p_type,
    p_options,
    case
      when array_length(p_options, 1) is null then array[]::int[]
      else array_fill(0, array[array_length(p_options, 1)])
    end,
    start_ts,
    p_end_ts
  )
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function apply_poll_delta(
  p_poll_id bigint,
  p_old_mask bigint,
  p_new_mask bigint
)
returns table (
  votes int[],
  total_votes int
)
language plpgsql
SECURITY DEFINER
as $$
declare
  added bigint := p_new_mask & ~p_old_mask;
  removed bigint := p_old_mask & ~p_new_mask;

  i int := 0;
  v_votes int[];
  v_total_votes int;
begin
  select p.votes, p.total_votes
  into v_votes, v_total_votes
  from public.polls p
  where p.id = p_poll_id
  for update;
  
  if not found then
    raise exception 'poll % not found', p_poll_id;
  end if;

  if p_new_mask = 0 then
    raise exception 'vote mask cannot be 0';
  end if;

  if p_old_mask = 0 then
    v_total_votes := v_total_votes + 1;
  end if;

  while removed > 0 loop
    if (removed & 1) = 1 then
      v_votes[i + 1] := v_votes[i + 1] - 1;
    end if;

    removed := removed >> 1;
    i := i + 1;
  end loop;

  i := 0;
  while added > 0 loop
    if (added & 1) = 1 then
      v_votes[i + 1] := v_votes[i + 1] + 1;
    end if;

    added := added >> 1;
    i := i + 1;
  end loop;

  update public.polls p
  set
    votes = v_votes,
    total_votes = v_total_votes
  where p.id = p_poll_id;

  return query
  select v_votes, v_total_votes;
end;
$$;

create or replace function submit_vote(
  p_user_id uuid,
  p_poll_id bigint,
  p_new_mask bigint
)
returns table (
  votes int[],
  total_votes int
)
language plpgsql
SECURITY DEFINER
as $$
declare
  v_old_poll_id bigint;
  v_old_mask bigint;
begin
  select poll_id, answer
  into v_old_poll_id, v_old_mask
  from public.poll_answers
  where user_id = p_user_id;
  
  insert into public.poll_answers(user_id, poll_id, answer)
  values (p_user_id, p_poll_id, p_new_mask)
  on conflict (user_id)
  do update set
    poll_id = excluded.poll_id,
    answer = excluded.answer;

  if v_old_poll_id = p_poll_id then
    return query
    select *
    from apply_poll_delta(p_poll_id, v_old_mask, p_new_mask);
  else
    return query
    select *
    from apply_poll_delta(p_poll_id, 0, p_new_mask);
  end if;
end;
$$;

alter table polls enable row level security;

create policy "read polls"
on polls
for select
using (true);

alter table poll_answers enable row level security;

create policy "users read own answers"
on poll_answers
for select
using (auth.uid() = user_id);

create policy "users insert own answers"
on poll_answers
for insert
with check (auth.uid() = user_id);

create policy "users update own answers"
on poll_answers
for update
using (auth.uid() = user_id);