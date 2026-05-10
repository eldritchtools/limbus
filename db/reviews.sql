create type item_type_enum as enum (
    'identity',
    'ego'
);

create table public.reviews (
    id bigint generated always as identity primary key,

    user_id uuid not null references public.users(id) on delete cascade,

    item_type item_type_enum not null,
    item_id integer not null,

    criteria_1 smallint not null check (criteria_1 between 0 and 10),
    criteria_2 smallint not null check (criteria_2 between 0 and 10),
    criteria_3 smallint not null check (criteria_3 between 0 and 10),
    criteria_4 smallint not null check (criteria_4 between 0 and 10),
    criteria_5 smallint not null check (criteria_5 between 0 and 10),

    review_text text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    bump_count integer not null default 0,
    last_bumped_at timestamptz,

    unique(user_id, item_type, item_id)
);

create table public.item_rating_aggregates (
    item_type item_type_enum not null,
    item_id integer not null,

    criteria_1_sum integer not null default 0,
    criteria_2_sum integer not null default 0,
    criteria_3_sum integer not null default 0,
    criteria_4_sum integer not null default 0,
    criteria_5_sum integer not null default 0,

    vote_count integer not null default 0,

    primary key (item_type, item_id)
);

create index reviews_item_lookup_idx
on public.reviews (item_type, item_id, updated_at desc);

create index reviews_written_latest_idx
on public.reviews (item_type, item_id, updated_at desc)
where review_text is not null and length(trim(review_text)) > 0;

create index reviews_written_active_idx
on public.reviews (item_type, item_id, last_bumped_at desc)
where review_text is not null and length(trim(review_text)) > 0;

create index reviews_written_top_idx
on public.reviews (item_type, item_id, bump_count desc, updated_at desc)
where review_text is not null and length(trim(review_text)) > 0;

create index reviews_user_lookup_idx
on public.reviews (user_id);

create index reviews_written_reviews_idx
on public.reviews (item_type, item_id)
where review_text is not null and length(trim(review_text)) > 0;

alter table public.reviews enable row level security;
alter table public.item_rating_aggregates enable row level security;

create policy "reviews are viewable by everyone"
on public.reviews
for select
using (true);

create policy "users can insert own reviews"
on public.reviews
for insert
with check (
    auth.uid() = user_id
);

create policy "users can update own reviews"
on public.reviews
for update
using (
    auth.uid() = user_id
)
with check (
    auth.uid() = user_id
);

create policy "users can delete own reviews"
on public.reviews
for delete
using (
    auth.uid() = user_id
);

create policy "aggregates readable by everyone"
on public.item_rating_aggregates
for select
using (true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin

    if
        new.criteria_1 is distinct from old.criteria_1
        or new.criteria_2 is distinct from old.criteria_2
        or new.criteria_3 is distinct from old.criteria_3
        or new.criteria_4 is distinct from old.criteria_4
        or new.criteria_5 is distinct from old.criteria_5
        or new.review_text is distinct from old.review_text
    then
        new.updated_at = now();
    end if;

    return new;

end;
$$;

create trigger set_reviews_updated_at
before update on public.reviews
for each row
execute function public.set_updated_at();

create or replace function public.submit_review(
    p_item_type item_type_enum,
    p_item_id integer,

    p_criteria_1 smallint,
    p_criteria_2 smallint,
    p_criteria_3 smallint,
    p_criteria_4 smallint,
    p_criteria_5 smallint,

    p_review_text text
)
returns public.reviews
language plpgsql
security definer
set search_path = public
as $$
declare
    existing_review public.reviews;
    result_review public.reviews;
    is_new boolean;
begin

    -- authentication check
    if auth.uid() is null then
        raise exception 'not authenticated';
    end if;

    -- fetch existing review (if any)
    select *
    into existing_review
    from public.reviews
    where user_id = auth.uid()
      and item_type = p_item_type
      and item_id = p_item_id;

    is_new := not found;

    -- UPSERT REVIEW (single source of truth)
    insert into public.reviews (
        user_id,
        item_type,
        item_id,

        criteria_1,
        criteria_2,
        criteria_3,
        criteria_4,
        criteria_5,

        review_text
    )
    values (
        auth.uid(),
        p_item_type,
        p_item_id,

        p_criteria_1,
        p_criteria_2,
        p_criteria_3,
        p_criteria_4,
        p_criteria_5,

        p_review_text
    )
    on conflict (user_id, item_type, item_id)
    do update set
        criteria_1 = excluded.criteria_1,
        criteria_2 = excluded.criteria_2,
        criteria_3 = excluded.criteria_3,
        criteria_4 = excluded.criteria_4,
        criteria_5 = excluded.criteria_5,
        review_text = excluded.review_text
    returning *
    into result_review;

    -- UPDATE AGGREGATES (delta-based, single logic path)
    insert into public.item_rating_aggregates (
        item_type,
        item_id,
        criteria_1_sum,
        criteria_2_sum,
        criteria_3_sum,
        criteria_4_sum,
        criteria_5_sum,
        vote_count
    )
    values (
        p_item_type,
        p_item_id,
        p_criteria_1,
        p_criteria_2,
        p_criteria_3,
        p_criteria_4,
        p_criteria_5,
        1
    )
    on conflict (item_type, item_id)
    do update set
        criteria_1_sum =
            item_rating_aggregates.criteria_1_sum
            + excluded.criteria_1_sum
            - coalesce(existing_review.criteria_1, 0)
        ,

        criteria_2_sum =
            item_rating_aggregates.criteria_2_sum
            + excluded.criteria_2_sum
            - coalesce(existing_review.criteria_2, 0)
        ,

        criteria_3_sum =
            item_rating_aggregates.criteria_3_sum
            + excluded.criteria_3_sum
            - coalesce(existing_review.criteria_3, 0)
        ,

        criteria_4_sum =
            item_rating_aggregates.criteria_4_sum
            + excluded.criteria_4_sum
            - coalesce(existing_review.criteria_4, 0)
        ,

        criteria_5_sum =
            item_rating_aggregates.criteria_5_sum
            + excluded.criteria_5_sum
            - coalesce(existing_review.criteria_5, 0)
        ,

        vote_count =
            item_rating_aggregates.vote_count
            + case when is_new then 1 else 0 end;

    return result_review;

end;
$$;

create or replace function public.delete_review(
    p_item_type item_type_enum,
    p_item_id integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    existing_review public.reviews;
begin

    if auth.uid() is null then
        raise exception 'not authenticated';
    end if;

    -- fetch user's review
    select *
    into existing_review
    from public.reviews
    where user_id = auth.uid()
      and item_type = p_item_type
      and item_id = p_item_id;

    if not found then
        raise exception 'review not found';
    end if;

    -- delete review
    delete from public.reviews
    where id = existing_review.id;

    -- update aggregates
    update public.item_rating_aggregates
    set
        criteria_1_sum = criteria_1_sum - existing_review.criteria_1,
        criteria_2_sum = criteria_2_sum - existing_review.criteria_2,
        criteria_3_sum = criteria_3_sum - existing_review.criteria_3,
        criteria_4_sum = criteria_4_sum - existing_review.criteria_4,
        criteria_5_sum = criteria_5_sum - existing_review.criteria_5,

        vote_count = vote_count - 1
    where item_type = p_item_type
      and item_id = p_item_id;

    -- optional cleanup
    delete from public.item_rating_aggregates
    where item_type = p_item_type
      and item_id = p_item_id
      and vote_count <= 0;

end;
$$;

create table public.user_bump_state (
    user_id uuid primary key references auth.users(id) on delete cascade,
    last_bump_at timestamptz
);

alter table public.user_bump_state enable row level security;

create policy "users can view their own bump state"
on public.user_bump_state
for select
using (
    auth.uid() = user_id
);

create policy "users can create their own bump state"
on public.user_bump_state
for insert
with check (
    auth.uid() = user_id
);

create policy "users can update their own bump state"
on public.user_bump_state
for update
using (
    auth.uid() = user_id
)
with check (
    auth.uid() = user_id
);

create or replace function public.bump_review(
    p_review_id bigint
)
returns table (
    success boolean,
    last_bump_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_last_bump timestamptz;
    v_now timestamptz := now();
begin

    v_user_id := auth.uid();

    if v_user_id is null then
        return query
        select false, null::timestamptz;
        return;
    end if;

    -- get cooldown state
    select ub.last_bump_at
    into v_last_bump
    from public.user_bump_state ub
    where ub.user_id = v_user_id;

    -- cooldown check (10 min example)
    if v_last_bump is not null
       and v_now - v_last_bump < interval '10 minutes' then

        return query
        select false, v_last_bump;

        return;
    end if;

    -- apply bump
    update public.reviews
    set
        bump_count = bump_count + 1,
        last_bumped_at = v_now
    where id = p_review_id;

    -- upsert user cooldown state
    insert into public.user_bump_state (user_id, last_bump_at)
    values (v_user_id, v_now)
    on conflict (user_id)
    do update set last_bump_at = v_now;

    -- success response
    return query
    select true, v_now;

end;
$$;