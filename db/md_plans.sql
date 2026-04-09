CREATE TABLE public.md_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  recommendation_mode TEXT,
  difficulty TEXT,
  identity_ids INT[] DEFAULT '{}',
  ego_ids INT[] DEFAULT '{}',
  grace_levels INT[] DEFAULT '{}',
  cost INT,
  keyword_id INT,
  start_gift_ids INT[] DEFAULT '{}',
  observe_gift_ids INT[] DEFAULT '{}',
  target_gift_ids INT[] DEFAULT '{}',
  floors JSONB,
  youtube_video_id TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  block_discovery BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  score NUMERIC DEFAULT 0,
  search_vector tsvector,
  pinned_comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,
);

CREATE TABLE public.md_plan_builds (
  plan_id UUID REFERENCES public.md_plans(id) ON DELETE CASCADE,
  build_id UUID REFERENCES public.builds(id) ON DELETE CASCADE,

  position INT,

  PRIMARY KEY (plan_id, build_id)
);

CREATE TABLE public.md_plan_tags (
  plan_id UUID REFERENCES public.md_plans(id) ON DELETE CASCADE,
  tag_id INT REFERENCES public.tags(id) ON DELETE CASCADE,

  PRIMARY KEY (plan_id, tag_id)
);

CREATE INDEX md_plans_user_idx ON public.md_plans(user_id);
CREATE INDEX md_plans_published_created_at_idx ON public.md_plans(is_published, created_at desc);
CREATE INDEX md_plans_user_created_at_idx ON public.md_plans(user_id, created_at desc);
CREATE INDEX md_plans_score_idx ON public.md_plans(score DESC);
CREATE INDEX md_plans_search_idx ON public.md_plans USING GIN(search_vector);

CREATE INDEX md_plan_builds_plan_idx ON public.md_plan_builds(plan_id);
CREATE INDEX md_plan_builds_position_idx ON public.md_plan_builds(plan_id, position);

CREATE INDEX md_plan_tags_plan_idx ON public.md_plan_tags(plan_id);
CREATE INDEX md_plan_tags_tag_idx ON public.md_plan_tags(tag_id);

ALTER TABLE public.md_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.md_plan_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.md_plan_tags ENABLE ROW LEVEL SECURITY;

create policy "Public md plans are viewable"
on public.md_plans
for select
using (true);

create policy "Users can create md plans"
on public.md_plans
for insert
with check (auth.uid() = user_id);

create policy "Users can update own md plans"
on public.md_plans
for update
using (auth.uid() = user_id);

create policy "Users can delete own md plans"
on public.md_plans
for delete
using (auth.uid() = user_id);

create policy "md plan builds follow plan visibility"
on public.md_plan_builds
for select
using (true);

create policy "Users manage own md plan builds"
on public.md_plan_builds
for all
using (
  exists (
    select 1 from public.md_plans
    where md_plans.id = md_plan_builds.plan_id
    and md_plans.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.md_plans
    where md_plans.id = md_plan_builds.plan_id
    and md_plans.user_id = auth.uid()
  )
);

create policy "md plan tags follow plan ownership"
on public.md_plan_tags
for all
using (
  exists (
    select 1
    from public.md_plans mp
    where mp.id = md_plan_tags.plan_id
    and mp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.md_plans mp
    where mp.id = md_plan_tags.plan_id
    and mp.user_id = auth.uid()
  )
);

create or replace function public.search_md_plans_v1(
  p_query text default null,
  plan_id_filter uuid[] default null,
  username_exact_filter text default null,
  user_id_filter uuid default null,
  tag_filter text[] default null,
  p_sort_by text default null,
  p_limit int default 20,
  p_offset int default 0,
  p_published boolean default true,
  p_ignore_block_discovery boolean default false
)
returns table (
  id uuid,
  user_id uuid,
  username text,
  user_flair text,
  title text,
  body text,
  difficulty text,
  cost int,
  keyword_id int,
  created_at timestamptz,
  published_at timestamptz,
  tags text[],
  like_count int,
  comment_count int
)
language plpgsql
security definer
as $$
declare
  v_sort text;
  v_tsquery tsquery;
begin

  if p_sort_by is not null then
    v_sort := p_sort_by;
  elsif p_query is not null then
    v_sort := 'search';
  else
    v_sort := 'new';
  end if;

  if p_query is not null then
    v_tsquery := plainto_tsquery('english', p_query);
  end if;

  return query

  WITH plans AS (
    SELECT
      p.id,
      p.user_id,
      u.username,
      u.flair,
      p.title,
      p.body,
      p.difficulty,
      p.cost,
      p.keyword_id,
      p.created_at,
      p.published_at,
      p.search_vector,
      p.like_count,
      p.comment_count,

      CASE
        WHEN v_sort = 'search' AND v_tsquery IS NOT NULL THEN ts_rank(p.search_vector, v_tsquery)
        WHEN v_sort = 'new' THEN extract(epoch from coalesce(p.published_at, p.created_at))
        WHEN v_sort = 'popular' THEN p.score
        WHEN v_sort = 'random' THEN random()
      END AS sort_value

    FROM public.md_plans p
    JOIN public.users u ON p.user_id = u.id

    WHERE p.is_published = p_published
      AND (plan_id_filter IS NULL OR p.id = ANY(plan_id_filter))
      AND (username_exact_filter IS NULL OR u.username = username_exact_filter)
      AND (user_id_filter IS NULL OR p.user_id = user_id_filter)
      AND (v_tsquery IS NULL OR p.search_vector @@ v_tsquery)
      AND (p_ignore_block_discovery = TRUE OR p.block_discovery = FALSE)

      AND (
        tag_filter IS NULL OR EXISTS (
          SELECT 1
          FROM public.md_plan_tags pt
          JOIN public.tags t ON t.id = pt.tag_id
          WHERE pt.plan_id = p.id
          AND t.name = ANY(tag_filter)
        )
      )

    ORDER BY sort_value DESC
    LIMIT p_limit OFFSET p_offset
  ),

  plan_tags AS (
    SELECT
      pt.plan_id,
      array_agg(distinct t.name) AS tags
    FROM public.md_plan_tags pt
    JOIN public.tags t ON t.id = pt.tag_id
    GROUP BY pt.plan_id
  )

  SELECT
    p.id,
    p.user_id,
    p.username,
    p.flair AS user_flair,
    p.title,
    p.body,
    p.difficulty,
    p.cost,
    p.keyword_id,
    p.created_at,
    p.published_at,
    coalesce(pt.tags, array[]::text[]) AS tags,
    p.like_count,
    p.comment_count
  FROM plans p
  LEFT JOIN plan_tags pt ON pt.plan_id = p.id

  GROUP BY
    p.id,
    p.user_id,
    p.username,
    p.flair,
    p.title,
    p.body,
    p.difficulty,
    p.cost,
    p.keyword_id,
    p.created_at,
    p.published_at,
    pt.tags,
    p.sort_value,
    p.like_count,
    p.comment_count

  ORDER BY p.sort_value DESC;

end;
$$;

create or replace function public.create_md_plan_v1(
  p_title text,
  p_body text,
  p_recommendation_mode text,
  p_difficulty text,
  p_identity_ids int[],
  p_ego_ids int[],
  p_grace_levels int[],
  p_cost int,
  p_keyword_id int,
  p_start_gift_ids int[],
  p_observe_gift_ids int[],
  p_target_gift_ids int[],
  p_floors jsonb,
  p_youtube_video_id text,
  p_is_published boolean,
  p_block_discovery boolean,
  p_build_ids uuid[],
  p_tags text[]
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_plan_id uuid;
  v_user_id uuid := auth.uid();
  v_username text;
  v_position int := 0;

  tag_name text;
  tag_id int;
  build_id uuid;
begin

  select username into v_username
  from public.users
  where id = v_user_id;

  insert into public.md_plans (
    user_id,
    title,
    body,
    recommendation_mode,
    difficulty,
    identity_ids,
    ego_ids,
    grace_levels,
    cost,
    keyword_id,
    start_gift_ids,
    observe_gift_ids,
    target_gift_ids,
    floors,
    youtube_video_id,
    is_published,
    block_discovery,
    published_at,
    search_vector
  )
  values (
    v_user_id,
    p_title,
    p_body,
    p_recommendation_mode,
    p_difficulty,
    p_identity_ids,
    p_ego_ids,
    p_grace_levels,
    p_cost,
    p_keyword_id,
    p_start_gift_ids,
    p_observe_gift_ids,
    p_target_gift_ids,
    p_floors,
    p_youtube_video_id,
    p_is_published,
    p_block_discovery,
    case when p_is_published then now() else null end,
    to_tsvector(
      'english',
      coalesce(p_title,'') || ' ' ||
      coalesce(p_body,'') || ' ' ||
      coalesce(v_username,'')
    )
  )
  returning id into v_plan_id;

  foreach tag_name in array p_tags loop

    insert into public.tags (name)
    values (tag_name)
    on conflict (name) do update set name = excluded.name
    returning id into tag_id;

    insert into public.md_plan_tags (plan_id, tag_id)
    values (v_plan_id, tag_id)
    on conflict do nothing;

  end loop;

  foreach build_id in array p_build_ids loop

    insert into public.md_plan_builds (
      plan_id,
      build_id,
      position
    )
    values (
      v_plan_id,
      build_id,
      v_position
    );

    v_position := v_position + 1;

  end loop;

  return v_plan_id;

end;
$$;

create or replace function public.update_md_plan_v1(
  p_plan_id uuid,
  p_title text,
  p_body text,
  p_recommendation_mode text,
  p_difficulty text,
  p_identity_ids int[],
  p_ego_ids int[],
  p_grace_levels int[],
  p_cost int,
  p_keyword_id int,
  p_start_gift_ids int[],
  p_observe_gift_ids int[],
  p_target_gift_ids int[],
  p_floors jsonb,
  p_youtube_video_id text,
  p_is_published boolean,
  p_block_discovery boolean,
  p_build_ids uuid[],
  p_tags text[]
)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_username text;

  v_position int := 0;

  tag_name text;
  _tag_id int;
  _tag_ids int[];
  _build_id uuid;
begin

  if not exists (
    select 1 from public.md_plans
    where id = p_plan_id
    and user_id = v_user_id
  ) then
    raise exception 'Not authorized';
  end if;

  select username into v_username
  from public.users
  where id = v_user_id;

  update public.md_plans
  set
    title = p_title,
    body = p_body,
    recommendation_mode = p_recommendation_mode,
    difficulty = p_difficulty,
    identity_ids = p_identity_ids,
    ego_ids = p_ego_ids,
    grace_levels = p_grace_levels,
    cost = p_cost,
    keyword_id = p_keyword_id,
    start_gift_ids = p_start_gift_ids,
    observe_gift_ids = p_observe_gift_ids,
    target_gift_ids = p_target_gift_ids,
    floors = p_floors,
    youtube_video_id = p_youtube_video_id,
    is_published = p_is_published,
    block_discovery = p_block_discovery,
    published_at = case when p_is_published then coalesce(published_at, now()) else null end,
    updated_at = now(),
    search_vector =
      to_tsvector(
        'english',
        coalesce(p_title,'') || ' ' ||
        coalesce(p_body,'') || ' ' ||
        coalesce(v_username,'')
      )
  where id = p_plan_id;

  delete from public.md_plan_builds
  where plan_id = p_plan_id;

  foreach _build_id in array p_build_ids loop

    insert into public.md_plan_builds (
      plan_id,
      build_id,
      position
    )
    values (
      p_plan_id,
      _build_id,
      v_position
    );

    v_position := v_position + 1;

  end loop;

  _tag_ids := array[]::int[];

  foreach tag_name in array p_tags loop

    insert into public.tags (name)
    values (tag_name)
    on conflict (name) do update set name = excluded.name
    returning id into _tag_id;

    _tag_ids := array_append(_tag_ids, _tag_id);

  end loop;

  delete from public.md_plan_tags
  where plan_id = p_plan_id
  and tag_id not in (select unnest(_tag_ids));

  insert into public.md_plan_tags (plan_id, tag_id)
  select p_plan_id, unnest(_tag_ids)
  on conflict do nothing;

end;
$$;

create or replace function public.get_md_plan_v2(
  p_plan_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_result jsonb;
begin

  update public.md_plans p
  set view_count = p.view_count + 1
  where p.id = p_plan_id
  and p.is_published = true
  and (v_user_id is null or p.user_id <> v_user_id);

  WITH plan_data AS (
    SELECT
      p.*,
      u.username,
      u.flair,
      u.socials,
      pc.user_id AS pinned_user_id,
      pc.body AS pinned_body,
      pc.created_at AS pinned_created_at,
      pc.edited AS pinned_edited,
      pu.username AS pinned_username,
      pu.flair AS pinned_user_flair,
      pp.body AS parent_body,
      ppu.username AS parent_author,
      ppu.flair AS parent_flair,
      pp.deleted AS parent_deleted
    FROM public.md_plans p
    JOIN public.users u ON u.id = p.user_id
    LEFT JOIN public.comments pc ON p.pinned_comment_id = pc.id AND NOT pc.deleted
    LEFT JOIN public.users pu ON pu.id = pc.user_id
    LEFT JOIN public.comments pp ON pp.id = pc.parent_id
    LEFT JOIN public.users ppu ON ppu.id = pp.user_id
    WHERE p.id = p_plan_id
  ),

  builds AS (
    SELECT
      pb.plan_id,
      jsonb_agg(
        to_jsonb(b)
        ORDER BY pb.position
      ) AS builds
    FROM public.md_plan_builds pb
    JOIN public.search_builds_v9(
      build_id_filter := ARRAY(
        SELECT build_id
        FROM public.md_plan_builds
        WHERE plan_id = p_plan_id
      ),
      p_published := true,
      p_limit := 1000,
      p_ignore_block_discovery := true,
      p_include_egos := true
    ) b
      ON b.id = pb.build_id

    WHERE pb.plan_id = p_plan_id
    GROUP BY pb.plan_id
  ),

  tags AS (
    SELECT
      pt.plan_id,
      jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'name', t.name
        )
      ) AS tags
    FROM public.md_plan_tags pt
    JOIN public.tags t ON t.id = pt.tag_id
    WHERE pt.plan_id = p_plan_id
    GROUP BY pt.plan_id
  )

  SELECT jsonb_build_object(
    'id', p.id,
    'user_id', p.user_id,
    'username', p.username,
    'user_flair', p.flair,
    'user_socials', p.socials,
    'title', p.title,
    'body', p.body,
    'recommendation_mode', p.recommendation_mode,
    'difficulty', p.difficulty,
    'identity_ids', p.identity_ids,
    'ego_ids', p.ego_ids,
    'grace_levels', p.grace_levels,
    'cost', p.cost,
    'keyword_id', p.keyword_id,
    'start_gift_ids', p.start_gift_ids,
    'observe_gift_ids', p.observe_gift_ids,
    'target_gift_ids', p.target_gift_ids,
    'floors', p.floors,
    'youtube_video_id', p.youtube_video_id,
    'is_published', p.is_published,
    'created_at', p.created_at,
    'published_at', p.published_at,
    'updated_at', p.updated_at,
    'view_count',
      case when p.user_id = v_user_id then p.view_count else null end,
    'like_count', p.like_count,
    'comment_count', p.comment_count,
    'block_discovery', p.block_discovery,
    'tags', coalesce(t.tags, '[]'::jsonb),
    'builds', coalesce(b.builds, '[]'::jsonb),
    'pinned_comment', CASE
      WHEN p.pinned_comment_id IS NULL THEN NULL
      ELSE jsonb_build_object(
        'id', p.pinned_comment_id,
        'user_id', p.pinned_user_id,
        'username', p.pinned_username,
        'user_flair', p.pinned_user_flair,
        'body', p.pinned_body,
        'created_at', p.pinned_created_at,
        'edited', p.pinned_edited,
        'parent_body', p.parent_body,
        'parent_author', p.parent_author,
        'parent_flair', p.parent_flair,
        'parent_deleted', p.parent_deleted
      )
    END
  )

  into v_result

  from plan_data p
  left join builds b on b.plan_id = p.id
  left join tags t on t.plan_id = p.id;

  return v_result;

end;
$$;

CREATE OR REPLACE FUNCTION public.get_saved_md_plans(
  p_user_id UUID,
  p_sort_by text DEFAULT NULL,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
returns table (
  id uuid,
  user_id uuid,
  username text,
  user_flair text,
  title text,
  body text,
  difficulty text,
  cost int,
  keyword_id int,
  created_at timestamptz,
  published_at timestamptz,
  tags text[],
  like_count int,
  comment_count int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  saved_ids UUID[];
BEGIN
  -- get all saved md plan IDs for the user
  SELECT COALESCE(ARRAY_AGG(target_id), ARRAY[]::UUID[])
  INTO saved_ids
  FROM public.saves s
  WHERE s.user_id = p_user_id
    AND target_type = 'md_plan';

  IF saved_ids = '{}' THEN
    RETURN;
  END IF;

  -- call search_md_plans with the filter
  RETURN QUERY
    SELECT *
    FROM public.search_md_plans_v1(
      p_query := NULL,
      plan_id_filter := saved_ids,
      username_exact_filter := NULL,
      user_id_filter := NULL,
      tag_filter := NULL,
      p_sort_by := p_sort_by,
      p_limit := p_limit,
      p_offset := p_offset,
      p_published := TRUE,
      p_ignore_block_discovery := TRUE
    );
END;
$$;
