create table survey_responses (
    survey_id int not null,
    user_id uuid not null,
    answers jsonb not null,
    updated_at timestamptz not null default now(),

    primary key (survey_id, user_id)
);

create table survey_aggregates (
    survey_id int not null,
    question_index int not null,
    answer text not null,
    count int not null default 0,

    primary key (
        survey_id,
        question_index,
        answer
    )
);

grant select on survey_responses to authenticated;
grant select on survey_aggregates to authenticated;

alter table survey_responses enable row level security;
alter table survey_aggregates enable row level security;

create policy "read own response"
on survey_responses
for select
using (auth.uid() = user_id);

create policy "public read aggregates"
on survey_aggregates
for select
using (true);

create or replace function submit_survey_response(
    p_survey_id int,
    p_answers jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();

    v_old_answers jsonb;

    v_question record;
    v_answer text;
begin
    if v_user_id is null then
        raise exception 'Not authenticated';
    end if;

    if jsonb_typeof(p_answers) <> 'array' then
        raise exception 'answers must be a JSON array';
    end if;

    select answers
    into v_old_answers
    from survey_responses
    where survey_id = p_survey_id and user_id = v_user_id;

    if v_old_answers is not null then
        for v_question in
            select
                ordinality - 1 as question_index,
                value as answers
            from jsonb_array_elements(v_old_answers)
            with ordinality
        loop
            for v_answer in
                select jsonb_array_elements_text(v_question.answers)
            loop
                update survey_aggregates
                set count = count - 1
                where survey_id = p_survey_id
                  and question_index = v_question.question_index
                  and answer = v_answer;

                delete from survey_aggregates
                where survey_id = p_survey_id
                  and question_index = v_question.question_index
                  and answer = v_answer
                  and count <= 0;
            end loop;
        end loop;
    end if;


    insert into survey_responses (
        survey_id,
        user_id,
        answers,
        updated_at
    )
    values (
        p_survey_id,
        v_user_id,
        p_answers,
        now()
    )
    on conflict (survey_id, user_id)
    do update
    set
        answers = excluded.answers,
        updated_at = now();

    -- Add new aggregates
    for v_question in
        select
            ordinality - 1 as question_index,
            value as answers
        from jsonb_array_elements(p_answers)
        with ordinality
    loop
        for v_answer in
            select jsonb_array_elements_text(v_question.answers)
        loop
            insert into survey_aggregates (
                survey_id,
                question_index,
                answer,
                count
            )
            values (
                p_survey_id,
                v_question.question_index,
                v_answer,
                1
            )
            on conflict (survey_id, question_index, answer)
            do update
            set count = survey_aggregates.count + 1;
        end loop;
    end loop;
end;
$$;

grant execute on function submit_survey_response(int, jsonb)
to authenticated;

create or replace function get_survey_response_count(
    p_survey_id int
)
returns int
language sql
security definer
set search_path = public
as $$
    select count(*)::int
    from survey_responses
    where survey_id = p_survey_id;
$$;