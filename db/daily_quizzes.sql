create table daily_quizzes (
    id text not null,
    date date not null,
    data jsonb not null,
    created_at timestamptz not null default now(),

    primary key (id, date)
);

alter table public.daily_quizzes enable row level security;

create policy "Anyone can read daily quizzes"
on public.daily_quizzes
for select
using (true);

create policy "Anyone can insert daily quizzes"
on public.daily_quizzes
for insert
with check (true);

grant select on public.daily_quizzes to anon, authenticated;
grant insert on public.daily_quizzes to anon, authenticated;
revoke update on public.daily_quizzes from anon, authenticated;
revoke delete on public.daily_quizzes from anon, authenticated;

create table public.user_daily_quiz_stats (
    user_id uuid not null references public.users(id) on delete cascade,
    quiz_id text not null,
    last_completed_date date,
    last_completed_correct boolean,
    quizzes_played integer not null default 0,
    quizzes_correct integer not null default 0,
    updated_at timestamptz not null default now(),
    primary key (user_id, quiz_id)
);

alter table public.user_daily_quiz_stats
enable row level security;

create policy "Users can read their own stats"
on public.user_daily_quiz_stats
for select
using (auth.uid() = user_id);

create policy "Users can update their own stats"
on public.user_daily_quiz_stats
for insert
with check (auth.uid() = user_id);

create policy "Users can modify their own stats"
on public.user_daily_quiz_stats
for update
using (auth.uid() = user_id);

create or replace function public.submit_daily_result(
    p_quiz_id text,
    p_date date,
    p_correct boolean
)
returns table (
    already_completed boolean,
    quizzes_played integer,
    quizzes_correct integer
)
language plpgsql
security definer
as $$
declare
    v_stats public.user_daily_quiz_stats%rowtype;
begin

    select *
    into v_stats
    from public.user_daily_quiz_stats
    where user_id = auth.uid()
      and quiz_id = p_quiz_id;

    if found and v_stats.last_completed_date = p_date then
        return query
        select
            true,
            v_stats.quizzes_played,
            v_stats.quizzes_correct;
        return;
    end if;

    if not found then
        insert into public.user_daily_quiz_stats (
            user_id,
            quiz_id,
            quizzes_played,
            quizzes_correct,
            last_completed_date,
            last_completed_correct
        )
        values (
            auth.uid(),
            p_quiz_id,
            1,
            case when p_correct then 1 else 0 end,
            p_date,
            p_correct
        );

        return query
        select
            false,
            1,
            case when p_correct then 1 else 0 end;

        return;
    end if;

    update public.user_daily_quiz_stats
    set
        quizzes_played = v_stats.quizzes_played + 1,
        quizzes_correct = v_stats.quizzes_correct + case when p_correct then 1 else 0 end,
        last_completed_date = p_date,
        last_completed_correct = p_correct,
        updated_at = now()
    where user_id = auth.uid()
      and quiz_id = p_quiz_id;

    return query
    select
        false,
        v_stats.quizzes_played + 1,
        v_stats.quizzes_correct + case when p_correct then 1 else 0 end;

end;
$$;
