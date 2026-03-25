CREATE TABLE public.builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  identity_ids INTEGER[] DEFAULT '{}',
  ego_ids INTEGER[] DEFAULT '{}',
  keyword_ids INTEGER[] DEFAULT '{}',
  deployment_order INTEGER[] DEFAULT '{}',
  active_sinners INTEGER NOT NULL,
  team_code TEXT,
  youtube_video_id TEXT,
  extra_opts TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  score NUMERIC DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  view_count INTEGER NOT NULL DEFAULT 0,
  block_discovery BOOLEAN NOT NULL DEFAULT FALSE,
  pinned_comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,
  search_vector tsvector
);

ALTER TABLE public.builds
ADD CONSTRAINT youtube_id_format CHECK (
  youtube_video_id IS NULL OR
  youtube_video_id ~ '^[a-zA-Z0-9_-]{6,}$'
);

ALTER TABLE public.builds
ADD CONSTRAINT title_length CHECK (char_length(title) BETWEEN 3 AND 100);

CREATE INDEX idx_builds_created_at ON public.builds (created_at DESC);
CREATE INDEX idx_builds_like_count ON public.builds (like_count DESC);
CREATE INDEX idx_builds_score_created_at ON public.builds (score DESC, created_at DESC);
CREATE INDEX idx_builds_identities ON builds USING GIN (identity_ids);
CREATE INDEX idx_builds_egos ON builds USING GIN (ego_ids);
CREATE INDEX idx_builds_keywords ON builds USING GIN (keyword_ids);
CREATE INDEX idx_builds_search ON builds USING GIN(search_vector);

ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;

-- Anyone can view builds
CREATE POLICY "Public can read builds"
ON public.builds
FOR SELECT
USING (true);

-- Only owner can modify
CREATE POLICY "Owner can modify their builds"
ON public.builds
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update their builds"
ON public.builds
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete their builds"
ON public.builds
FOR DELETE
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.search_builds_v9(
  p_query TEXT DEFAULT NULL,
  build_id_filter UUID[] DEFAULT NULL,
  username_exact_filter TEXT DEFAULT NULL,
  user_id_filter UUID DEFAULT NULL,
  tag_filter TEXT[] DEFAULT NULL,
  identity_filter INT[] DEFAULT NULL,
  identity_exclude INT[] DEFAULT NULL,
  ego_filter INT[] DEFAULT NULL,
  ego_exclude INT[] DEFAULT NULL,
  keyword_filter INT[] DEFAULT NULL,
  keyword_exclude INT[] DEFAULT NULL,
  p_sort_by TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_published BOOLEAN DEFAULT TRUE,
  p_strict_filter BOOLEAN DEFAULT FALSE,
  p_ignore_block_discovery BOOLEAN DEFAULT FALSE,
  p_include_egos BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  like_count INTEGER,
  comment_count INTEGER,
  deployment_order INTEGER[],
  active_sinners INTEGER,
  score NUMERIC,
  is_published BOOLEAN,
  username TEXT,
  user_flair TEXT,
  tags TEXT[],
  extra_opts TEXT,
  identity_ids INT[],
  keyword_ids INT[],
  ego_ids INT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sort TEXT;
  v_tsquery tsquery;
BEGIN

  -- Determine sort mode
  IF p_sort_by IS NOT NULL THEN
    v_sort := p_sort_by;
  ELSIF p_query IS NOT NULL THEN
    v_sort := 'search';
  ELSE
    v_sort := 'new';
  END IF;

  -- Build tsquery
  IF p_query IS NOT NULL THEN
    v_tsquery := plainto_tsquery('english', p_query);
  END IF;

  RETURN QUERY

  WITH builds AS (
    SELECT
      b.id,
      b.title,
      b.created_at,
      b.updated_at,
      b.published_at,
      b.like_count,
      b.comment_count,
      b.deployment_order,
      b.active_sinners,
      b.score,
      b.is_published,
      u.username,
      u.flair,
      b.extra_opts,
      b.identity_ids,
      b.keyword_ids,
      CASE WHEN p_include_egos THEN b.ego_ids ELSE NULL END AS ego_ids,
      b.search_vector,

      CASE
        WHEN v_sort = 'search' AND v_tsquery IS NOT NULL THEN ts_rank(b.search_vector, v_tsquery)
        WHEN v_sort = 'new' THEN EXTRACT(EPOCH FROM COALESCE(b.published_at, b.created_at))
        WHEN v_sort = 'popular' THEN b.score
        WHEN v_sort = 'random' THEN RANDOM()
      END AS sort_value

    FROM public.builds b
    JOIN public.users u ON b.user_id = u.id

    WHERE
      b.is_published = p_published
      AND (build_id_filter IS NULL OR b.id = ANY(build_id_filter))
      AND (username_exact_filter IS NULL OR u.username = username_exact_filter)
      AND (user_id_filter IS NULL OR b.user_id = user_id_filter)
      AND (v_tsquery IS NULL OR b.search_vector @@ v_tsquery)
      AND (p_ignore_block_discovery = TRUE OR b.block_discovery = FALSE)

      -- tag filter
      AND (
        tag_filter IS NULL OR EXISTS (
          SELECT 1
          FROM public.build_tags bt2
          JOIN public.tags t2 ON bt2.tag_id = t2.id
          WHERE bt2.build_id = b.id
          AND t2.name = ANY(tag_filter)
        )
      )

      -- identity filters
      AND (
        identity_filter IS NULL
        OR (
          (p_strict_filter = FALSE AND b.identity_ids && identity_filter)
          OR (p_strict_filter = TRUE AND b.identity_ids @> identity_filter)
        )
      )
      AND (
        identity_exclude IS NULL
        OR NOT (b.identity_ids && identity_exclude)
      )

      -- ego filters
      AND (
        ego_filter IS NULL
        OR (
          (p_strict_filter = FALSE AND b.ego_ids && ego_filter)
          OR (p_strict_filter = TRUE AND b.ego_ids @> ego_filter)
        )
      )
      AND (
        ego_exclude IS NULL
        OR NOT (b.ego_ids && ego_exclude)
      )

      -- keyword filters
      AND (
        keyword_filter IS NULL
        OR (
          (p_strict_filter = FALSE AND b.keyword_ids && keyword_filter)
          OR (p_strict_filter = TRUE AND b.keyword_ids @> keyword_filter)
        )
      )
      AND (
        keyword_exclude IS NULL
        OR NOT (b.keyword_ids && keyword_exclude)
      )

    ORDER BY sort_value DESC
    LIMIT p_limit OFFSET p_offset
  ),

  build_tags AS (
    SELECT
      bt.build_id,
      ARRAY_AGG(DISTINCT t.name) AS tags
    FROM public.build_tags bt
    JOIN public.tags t ON t.id = bt.tag_id
    GROUP BY bt.build_id
  )

  SELECT
    b.id,
    b.title,
    b.created_at,
    b.updated_at,
    b.published_at,
    b.like_count,
    b.comment_count,
    b.deployment_order,
    b.active_sinners,
    b.score,
    b.is_published,
    b.username,
    b.flair AS user_flair,
    COALESCE(bt.tags, ARRAY[]::TEXT[]) AS tags,
    b.extra_opts,
    b.identity_ids,
    b.keyword_ids,
    b.ego_ids

  FROM builds b
  LEFT JOIN build_tags bt ON bt.build_id = b.id

  ORDER BY b.sort_value DESC;

END;
$$;

CREATE OR REPLACE FUNCTION create_build_v4(
  p_user_id uuid,
  p_title TEXT,
  p_body TEXT,
  p_identity_ids INT[],
  p_ego_ids INT[],
  p_keyword_ids INT[],
  p_deployment_order INT[],
  p_active_sinners INT,
  p_team_code TEXT,
  p_youtube_video_id TEXT,
  p_tags TEXT[],
  p_extra_opts TEXT,
  p_block_discovery BOOLEAN,
  p_published BOOLEAN
)
RETURNS uuid
AS $$
DECLARE
  new_build_id uuid;
  tag_name TEXT;
  tag_id INT;
  v_username TEXT;
BEGIN
  -- get username for search vector
  SELECT username INTO v_username
  FROM public.users
  WHERE id = p_user_id;

  INSERT INTO builds (
    user_id,
    title,
    body,
    identity_ids,
    ego_ids,
    keyword_ids,
    deployment_order,
    active_sinners,
    team_code,
    youtube_video_id,
    extra_opts,
    block_discovery,
    is_published,
    published_at,
    search_vector
  )
  VALUES (
    p_user_id,
    p_title,
    p_body,
    p_identity_ids,
    p_ego_ids,
    p_keyword_ids,
    p_deployment_order,
    p_active_sinners,
    p_team_code,
    p_youtube_video_id,
    p_extra_opts,
    p_block_discovery,
    p_published,
    CASE WHEN p_published THEN NOW() ELSE NULL END,

    -- search vector
    to_tsvector(
      'english',
      coalesce(p_title,'') || ' ' ||
      coalesce(p_body,'') || ' ' ||
      coalesce(v_username,'')
    )
  )
  RETURNING id INTO new_build_id;

  FOREACH tag_name IN ARRAY p_tags LOOP
    INSERT INTO public.tags (name)
    VALUES (tag_name)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO tag_id;

    INSERT INTO public.build_tags (build_id, tag_id)
    VALUES (new_build_id, tag_id)
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN new_build_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_build_v4(
  p_build_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_identity_ids INT[],
  p_ego_ids INT[],
  p_keyword_ids INT[],
  p_deployment_order INT[],
  p_active_sinners INT,
  p_team_code TEXT,
  p_youtube_video_id TEXT,
  p_tags TEXT[],
  p_extra_opts TEXT,
  p_block_discovery BOOLEAN,
  p_published BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tag_name TEXT;
  _tag_id INT;
  _tag_ids INT[];
  owner_id UUID;
  was_published BOOLEAN;
  v_username TEXT;
BEGIN
  -- verify ownership
  SELECT user_id INTO owner_id FROM public.builds WHERE id = p_build_id;
  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'Build not found';
  END IF;
  IF owner_id != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized to edit this build';
  END IF;

  -- get username
  SELECT username INTO v_username
  FROM public.users
  WHERE id = p_user_id;

  SELECT is_published
  INTO was_published
  FROM public.builds
  WHERE id = p_build_id;

  -- update build core fields + search vector
  UPDATE public.builds
  SET
    title = p_title,
    body = p_body,
    identity_ids = p_identity_ids,
    ego_ids = p_ego_ids,
    keyword_ids = p_keyword_ids,
    deployment_order = p_deployment_order,
    active_sinners = p_active_sinners,
    team_code = p_team_code,
    youtube_video_id = p_youtube_video_id,
    extra_opts = p_extra_opts,
    is_published = p_published,
    block_discovery = p_block_discovery,
    published_at = CASE
      WHEN was_published = FALSE AND p_published = TRUE AND published_at IS NULL
      THEN NOW()
      ELSE published_at
    END,
    updated_at = NOW(),

    -- 🔥 recompute search vector
    search_vector = to_tsvector(
      'english',
      coalesce(p_title,'') || ' ' ||
      coalesce(p_body,'') || ' ' ||
      coalesce(v_username,'')
    )

  WHERE id = p_build_id;

  -- ensure tags exist
  _tag_ids := ARRAY[]::INT[];
  FOREACH tag_name IN ARRAY p_tags LOOP
    INSERT INTO public.tags (name)
    VALUES (tag_name)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO _tag_id;

    _tag_ids := array_append(_tag_ids, _tag_id);
  END LOOP;

  DELETE FROM public.build_tags
  WHERE build_id = p_build_id
  AND build_tags.tag_id NOT IN (SELECT unnest(_tag_ids));

  INSERT INTO public.build_tags (build_id, tag_id)
  SELECT p_build_id, unnest(_tag_ids)
  ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_build_v4(
  p_build_id UUID,
  p_for_edit BOOLEAN DEFAULT FALSE
)
RETURNS JSONB AS $$
DECLARE
  build_data JSONB;
  owner_id UUID;
  v_user_id uuid := auth.uid();
BEGIN
  select user_id into owner_id
  from public.builds
  where id = p_build_id;
  
  if owner_id is null then
    raise exception 'Build not found';
  end if;
  
  if p_for_edit and owner_id != v_user_id then
    raise exception 'Unauthorized to edit this build';
  end if;

  if not p_for_edit then
    update public.builds
    set view_count = view_count + 1
    where id = p_build_id
      and is_published = true
      and (
        v_user_id is null
        or owner_id <> v_user_id
      );
  end if;

  IF p_for_edit THEN
    SELECT jsonb_build_object(
      'id', b.id,
      'username', u.username,
      'user_flair', u.flair,
      'title', b.title,
      'body', b.body,
      'deployment_order', b.deployment_order,
      'active_sinners', b.active_sinners,
      'team_code', b.team_code,
      'youtube_video_id', b.youtube_video_id,
      'identity_ids', b.identity_ids,
      'ego_ids', b.ego_ids,
      'keyword_ids', b.keyword_ids,
      'tags', COALESCE(jsonb_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL), '[]'::JSONB),
      'extra_opts', b.extra_opts,
      'is_published', b.is_published,
      'block_discovery', b.block_discovery
    )
    INTO build_data
    FROM public.builds b
    LEFT JOIN public.users u ON b.user_id = u.id
    LEFT JOIN public.build_tags bt ON b.id = bt.build_id
    LEFT JOIN public.tags t ON bt.tag_id = t.id
    WHERE b.id = p_build_id
    GROUP BY b.id, u.username, u.flair;

  ELSE
    SELECT jsonb_build_object(
      'id', b.id,
      'user_id', u.id,
      'username', u.username,
      'user_flair', u.flair,
      'user_socials', u.socials,
      'title', b.title,
      'body', b.body,
      'deployment_order', b.deployment_order,
      'active_sinners', b.active_sinners,
      'team_code', b.team_code,
      'youtube_video_id', b.youtube_video_id,
      'identity_ids', b.identity_ids,
      'ego_ids', b.ego_ids,
      'keyword_ids', b.keyword_ids,
      'tags', COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
        'id', t.id,
        'name', t.name
      )) FILTER (WHERE t.id IS NOT NULL), '[]'::JSONB),
      'extra_opts', b.extra_opts,
      'like_count', b.like_count,
      'comment_count', b.comment_count,
      'created_at', b.created_at,
      'published_at', b.published_at,
      'updated_at', b.updated_at,
      'is_published', b.is_published,
      'view_count',
        case
          when owner_id = v_user_id then b.view_count
          else null
        end,
      'pinned_comment', CASE
        WHEN pc.id IS NULL THEN NULL
        ELSE jsonb_build_object(
          'id', pc.id,
          'user_id', pc.user_id,
          'username', pu.username,
          'user_flair', pu.flair,
          'body', pc.body,
          'created_at', pc.created_at,
          'edited', pc.edited,
          'parent_body', pp.body,
          'parent_author', ppu.username,
          'parent_flair', ppu.flair,
          'parent_deleted', pp.deleted
        )
        END
    )
    INTO build_data
    FROM public.builds b
    LEFT JOIN public.users u ON b.user_id = u.id
    LEFT JOIN public.build_tags bt ON b.id = bt.build_id
    LEFT JOIN public.tags t ON bt.tag_id = t.id
    LEFT JOIN public.comments pc ON b.pinned_comment_id = pc.id AND NOT pc.deleted
    LEFT JOIN public.users pu ON pu.id = pc.user_id
    LEFT JOIN public.comments pp ON pp.id = pc.parent_id
    LEFT JOIN public.users ppu ON ppu.id = pp.user_id
    WHERE b.id = p_build_id
    GROUP BY b.id, u.id, u.username, u.flair, pc.id, pu.username, pu.flair, pp.body, ppu.username, ppu.flair, pp.deleted;
  END IF;

  RETURN build_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_saved_builds_v4(
  p_user_id UUID,
  p_sort_by text DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  like_count INTEGER,
  comment_count INTEGER,
  deployment_order INTEGER[],
  active_sinners INTEGER,
  score NUMERIC,
  is_published BOOLEAN,
  username TEXT,
  user_flair TEXT,
  tags TEXT[],
  extra_opts TEXT,
  identity_ids INT[],
  keyword_ids INT[],
  ego_ids INT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  saved_ids UUID[];
BEGIN
  SELECT COALESCE(ARRAY_AGG(target_id), ARRAY[]::UUID[])
  INTO saved_ids
  FROM public.saves s
  WHERE s.user_id = p_user_id
    AND target_type = 'build';

  IF saved_ids = '{}' THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT *
    FROM public.search_builds_v9(
      build_id_filter := saved_ids,
      p_limit := p_limit,
      p_offset := p_offset,
      p_published := TRUE,
      p_ignore_block_discovery := TRUE
    );
END;
$$;
