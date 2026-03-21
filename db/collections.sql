ALTER TYPE target_type_enum ADD VALUE IF NOT EXISTS 'collection';

CREATE TYPE collection_submission_mode AS ENUM (
  'closed',
  'open'
);

create table public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  short_desc TEXT,

  is_published BOOLEAN DEFAULT TRUE,

  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  score NUMERIC DEFAULT 0,
  search_vector tsvector,
  view_count INTEGER NOT NULL DEFAULT 0,
  block_discovery BOOLEAN NOT NULL DEFAULT FALSE,
  submission_mode collection_submission_mode DEFAULT 'closed',
  pinned_comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

create index collections_user_id_idx on public.collections(user_id);
create index collections_created_at_idx on public.collections(created_at desc);
create index collections_published_idx on public.collections(is_published, created_at desc);
create index collections_user_created_idx on public.collections(user_id, created_at desc);
create index collections_search_idx on public.collections using gin (search_vector);

create table public.collection_items (
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  target_type target_type_enum,
  target_id UUID,

  note TEXT,
  position INTEGER NOT NULL,
  
  submitted_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (collection_id, target_type, target_id),
  UNIQUE (collection_id, position)
);

create index collection_items_collection_id_idx on public.collection_items(collection_id);
create index collection_items_target_id_idx on public.collection_items(target_type, target_id);
CREATE INDEX collection_items_collection_position_idx ON public.collection_items (collection_id, position);

create table public.collection_tags (
  collection_id uuid not null references public.collections(id) on delete cascade,
  tag_id int not null references public.tags(id) on delete cascade,

  primary key (collection_id, tag_id)
);

create index collection_tags_collection_id_idx on public.collection_tags(collection_id);
create index collection_tags_tag_id_idx on public.collection_tags(tag_id);

alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.collection_tags enable row level security;

create policy "Public collections are viewable"
on public.collections
for select
using (true);

create policy "Users can view own collections"
on public.collections
for select
using (auth.uid() = user_id);

create policy "Users can create collections"
on public.collections
for insert
with check (auth.uid() = user_id);

create policy "Users can update own collections"
on public.collections
for update
using (auth.uid() = user_id);

create policy "Users can delete own collections"
on public.collections
for delete
using (auth.uid() = user_id);

create policy "Collection items follow collection visibility"
on public.collection_items
for select
using (
  exists (
    select 1 from public.collections
    where collections.id = collection_items.collection_id
    and (
      collections.is_published = true
      or collections.user_id = auth.uid()
    )
  )
);

create policy "Users manage own collection items"
on public.collection_items
for all
using (
  exists (
    select 1 from public.collections
    where collections.id = collection_items.collection_id
    and collections.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.collections
    where collections.id = collection_items.collection_id
    and collections.user_id = auth.uid()
  )
);

create policy "Collection tags follow collection ownership"
on public.collection_tags
for all
using (
  exists (
    select 1
    from public.collections c
    where c.id = collection_tags.collection_id
    and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.collections c
    where c.id = collection_tags.collection_id
    and c.user_id = auth.uid()
  )
);

create or replace function public.search_collections_v2(
  p_query text default null,
  collection_id_filter UUID[] DEFAULT NULL,
  username_exact_filter TEXT DEFAULT NULL,
  user_id_filter UUID DEFAULT NULL,
  tag_filter TEXT[] DEFAULT NULL,
  p_sort_by text default null,
  p_limit int default 20,
  p_offset int default 0,
  p_published BOOLEAN DEFAULT TRUE,
  p_ignore_block_discovery boolean default false
)
returns table (
  id uuid,
  user_id uuid,
  username TEXT,
  user_flair TEXT,
  title text,
  short_desc text,
  submission_mode collection_submission_mode,
  created_at timestamptz,
  published_at timestamptz,
  tags TEXT[],
  like_count INT,
  comment_count INT,
  items jsonb
)
language plpgsql
security definer
as $$
declare
  v_sort text;
  v_tsquery tsquery;
begin

  -- Determine effective sort mode
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

  WITH collections AS (
    SELECT
      c.id,
      c.user_id,
      u.username,
      u.flair,
      c.title,
      c.short_desc,
      c.submission_mode,
      c.created_at,
      c.published_at,
      c.search_vector,
      c.like_count,
      c.comment_count,
      CASE
        WHEN v_sort = 'search' AND v_tsquery IS NOT NULL THEN ts_rank(c.search_vector, v_tsquery)
        WHEN v_sort = 'new' THEN EXTRACT(EPOCH FROM COALESCE(c.published_at, c.created_at))
        WHEN v_sort = 'popular' THEN c.score
        WHEN v_sort = 'random' THEN RANDOM()
      END AS sort_value 
    FROM public.collections c
    JOIN public.users u ON c.user_id = u.id
    WHERE c.is_published = p_published
      AND (collection_id_filter IS NULL OR c.id = ANY(collection_id_filter))
      AND (username_exact_filter IS NULL OR u.username = username_exact_filter)
      AND (user_id_filter IS NULL OR c.user_id = user_id_filter)
      AND (v_tsquery IS NULL OR c.search_vector @@ v_tsquery)
      AND (p_ignore_block_discovery = TRUE OR c.block_discovery = FALSE)
      AND (
        tag_filter IS NULL OR EXISTS (
          SELECT 1
          FROM public.collection_tags ct2
          JOIN public.tags t2 ON ct2.tag_id = t2.id
          WHERE ct2.collection_id = c.id
          AND t2.name = ANY(tag_filter)
        )
      )
    ORDER BY sort_value DESC
    LIMIT p_limit OFFSET p_offset
  ),

  collection_items_all AS (
    SELECT
      ci.collection_id,
      ci.target_type,
      ci.target_id,
      ci.position
    FROM public.collection_items ci
    JOIN collections c ON c.id = ci.collection_id
  ),

  all_build_ids AS (
    SELECT DISTINCT target_id AS id
    FROM collection_items_all
    WHERE target_type = 'build'
  ),

  all_md_plan_ids AS (
    SELECT DISTINCT target_id AS id
    FROM collection_items_all
    WHERE target_type = 'md_plan'
  ),

  builds AS (
    SELECT *
    FROM public.search_builds_v9(
      build_id_filter := ARRAY(SELECT abi.id FROM all_build_ids abi),
      p_limit := 1000,
      p_ignore_block_discovery := true
    )
  ),

  md_plans AS (
    SELECT *
    FROM public.search_md_plans_v1(
      plan_id_filter := ARRAY(SELECT ami.id FROM all_md_plan_ids ami),
      p_limit := 1000,
      p_ignore_block_discovery := true
    )
  ),

  all_content AS (
    SELECT
      b.id,
      'build'::target_type_enum AS type,
      to_jsonb(b) AS data
    FROM builds b

    UNION ALL

    SELECT
      p.id,
      'md_plan'::target_type_enum AS type,
      to_jsonb(p) AS data
    FROM md_plans p
  ),

  items AS (
    SELECT
      cia.collection_id,
      jsonb_agg(
        jsonb_build_object(
          'type', cia.target_type,
          'data', ac.data
        )
        ORDER BY cia.position
      ) AS items
    FROM collection_items_all cia
    LEFT JOIN all_content ac
      ON ac.id = cia.target_id
    AND ac.type = cia.target_type
    GROUP BY cia.collection_id
  ),

  collection_tags AS (
    SELECT
      ct.collection_id,
      ARRAY_AGG(DISTINCT t.name) AS tags
    FROM public.collection_tags ct
    JOIN public.tags t ON t.id = ct.tag_id
    GROUP BY ct.collection_id
  )

  SELECT
    c.id,
    c.user_id,
    c.username,
    c.flair AS user_flair,
    c.title,
    c.short_desc,
    c.submission_mode,
    c.created_at,
    c.published_at,
    COALESCE(ct.tags, ARRAY[]::TEXT[]) AS tags,
    c.like_count,
    c.comment_count,
    COALESCE(i.items, '[]'::jsonb) AS items

  FROM collections c
  LEFT JOIN items i ON i.collection_id = c.id
  LEFT JOIN collection_tags ct ON ct.collection_id = c.id

  GROUP BY
    c.id,
    c.user_id,
    c.username,
    c.flair,
    c.title,
    c.short_desc,
    c.submission_mode,
    c.created_at,
    c.published_at,
    ct.tags,
    c.sort_value,
    c.like_count,
    c.comment_count,
    i.items
  ORDER BY c.sort_value DESC;
end;
$$;

create or replace function public.create_collection_v1(
  p_title text,
  p_body text,
  p_short_desc text,
  p_is_published boolean,
  p_block_discovery boolean,
  p_items jsonb,
  p_submission_mode collection_submission_mode,
  p_tags TEXT[]
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_collection_id uuid;
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_position int := 0;
  v_username text;
  tag_name TEXT;
  tag_id INT;
begin
  -- get username for search vector
  select username into v_username
  from public.users
  where id = v_user_id;

  insert into public.collections (
    user_id,
    title,
    body,
    short_desc,
    submission_mode,
    is_published,
    block_discovery,
    published_at,
    search_vector
  )
  values (
    v_user_id,
    p_title,
    p_body,
    p_short_desc,
    p_submission_mode,
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
  returning id into v_collection_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.collection_items (
      collection_id,
      target_type,
      target_id,
      note,
      position,
      submitted_by
    )
    values (
      v_collection_id,
      (v_item->>'target_type')::target_type_enum,
      (v_item->>'target_id')::uuid,
      v_item->>'note',
      v_position,
      (v_item->>'submitted_by')::uuid
    );

    v_position := v_position + 1;
  end loop;

  FOREACH tag_name IN ARRAY p_tags LOOP
    INSERT INTO public.tags (name)
    VALUES (tag_name)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO tag_id;

    INSERT INTO public.collection_tags (collection_id, tag_id)
    VALUES (v_collection_id, tag_id)
    ON CONFLICT DO NOTHING;
  END LOOP;

  return v_collection_id;
end;
$$;

create or replace function public.update_collection_v1(
  p_collection_id uuid,
  p_title text,
  p_body text,
  p_short_desc text,
  p_submission_mode collection_submission_mode,
  p_is_published boolean,
  p_block_discovery boolean,
  p_items jsonb,
  p_tags TEXT[]
)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_position int := 0;
  v_username text;
  tag_name TEXT;
  _tag_id INT;
  _tag_ids INT[];
begin
  -- verify ownership
  if not exists (
    select 1 from public.collections
    where id = p_collection_id
      and user_id = v_user_id
  ) then
    raise exception 'Not authorized';
  end if;

  select username into v_username
  from public.users
  where id = v_user_id;

  update public.collections
  set title = p_title,
      body = p_body,
      short_desc = p_short_desc,
      submission_mode = p_submission_mode,
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
  where id = p_collection_id;

  delete from public.collection_items
  where collection_id = p_collection_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.collection_items (
      collection_id,
      target_type,
      target_id,
      note,
      position,
      submitted_by
    )
    values (
      p_collection_id,
      (v_item->>'target_type')::target_type_enum,
      (v_item->>'target_id')::uuid,
      v_item->>'note',
      v_position,
      (v_item->>'submitted_by')::uuid
    );

    v_position := v_position + 1;
  end loop;

  -- ensure tags exist and collect their IDs
  _tag_ids := ARRAY[]::INT[];
  FOREACH tag_name IN ARRAY p_tags LOOP
    INSERT INTO public.tags (name)
    VALUES (tag_name)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO _tag_id;

    _tag_ids := array_append(_tag_ids, _tag_id);
  END LOOP;

  DELETE FROM public.collection_tags
  WHERE collection_id = p_collection_id
  AND collection_tags.tag_id NOT IN (SELECT unnest(_tag_ids));

  INSERT INTO public.collection_tags (collection_id, tag_id)
  SELECT p_collection_id, unnest(_tag_ids)
  ON CONFLICT DO NOTHING;
end;
$$;

create or replace function public.get_collection_v2(
  p_collection_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_result jsonb;
begin
  update public.collections c
  set view_count = c.view_count + 1
  where c.id = p_collection_id
    and c.is_published = true
    and (v_user_id is null or c.user_id <> v_user_id);

  WITH collection_data AS (
    SELECT
      c.id,
      c.user_id,
      u.username,
      u.flair,
      c.title,
      c.body,
      c.short_desc,
      c.submission_mode,
      c.is_published,
      c.created_at,
      c.published_at,
      c.updated_at,
      c.view_count,
      c.like_count,
      c.comment_count,
      c.block_discovery,

      pc.id AS pinned_comment_id,
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

    FROM public.collections c
    JOIN public.users u ON c.user_id = u.id
    LEFT JOIN public.comments pc ON c.pinned_comment_id = pc.id AND NOT pc.deleted
    LEFT JOIN public.users pu ON pu.id = pc.user_id
    LEFT JOIN public.comments pp ON pp.id = pc.parent_id
    LEFT JOIN public.users ppu ON ppu.id = pp.user_id
    WHERE c.id = p_collection_id
  ),
    
  collection_items_all AS (
    SELECT
      ci.collection_id,
      ci.target_type,
      ci.target_id,
      ci.note,
      ci.submitted_by,
      ci.position
    FROM public.collection_items ci
    WHERE ci.collection_id = p_collection_id
  ),

  all_build_ids AS (
    SELECT DISTINCT target_id AS id
    FROM collection_items_all
    WHERE target_type = 'build'
  ),

  all_md_plan_ids AS (
    SELECT DISTINCT target_id AS id
    FROM collection_items_all
    WHERE target_type = 'md_plan'
  ),

  builds AS (
    SELECT *
    FROM public.search_builds_v9(
      build_id_filter := ARRAY(SELECT abi.id FROM all_build_ids abi),
      p_published := true,
      p_limit := 1000,
      p_ignore_block_discovery := true
    )
  ),

  md_plans AS (
    SELECT *
    FROM public.search_md_plans_v1(
      plan_id_filter := ARRAY(SELECT ami.id FROM all_md_plan_ids ami),
      p_published := true,
      p_limit := 1000,
      p_ignore_block_discovery := true
    )
  ),

  all_content AS (
    SELECT
      b.id,
      'build'::target_type_enum AS type,
      to_jsonb(b) AS data
    FROM builds b

    UNION ALL

    SELECT
      p.id,
      'md_plan'::target_type_enum AS type,
      to_jsonb(p) AS data
    FROM md_plans p
  ),

  collection_tags AS (
    SELECT
      ct.collection_id,
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'id', t.id,
          'name', t.name
        )
      ) AS tags
    FROM public.collection_tags ct
    JOIN public.tags t ON t.id = ct.tag_id
    WHERE ct.collection_id = p_collection_id
    GROUP BY ct.collection_id
  ),

  items AS (
    SELECT
      jsonb_agg(
        jsonb_build_object(
          'type', cia.target_type,
          'data', ac.data,
          'note', cia.note,
          'submitted_by', cia.submitted_by,
          'submitted_by_username', u_submit.username,
          'submitted_by_flair', u_submit.flair
        )
        ORDER BY cia.position
      ) AS items
    FROM collection_items_all cia
    LEFT JOIN all_content ac
      ON ac.id = cia.target_id
    AND ac.type = cia.target_type
    LEFT JOIN public.users u_submit
      ON cia.submitted_by = u_submit.id
  )

  SELECT jsonb_build_object(
    'id', c.id,
    'user_id', c.user_id,
    'username', c.username,
    'user_flair', c.flair,
    'title', c.title,
    'body', c.body,
    'short_desc', c.short_desc,
    'submission_mode', c.submission_mode,
    'is_published', c.is_published,
    'created_at', c.created_at,
    'published_at', c.published_at,
    'updated_at', c.updated_at,
    'view_count',
      CASE
        WHEN c.user_id = v_user_id THEN c.view_count
        ELSE NULL
      END,
    'like_count', c.like_count,
    'comment_count', c.comment_count,
    'block_discovery', c.block_discovery,
    'tags', COALESCE(ct.tags, '[]'::jsonb),
    'items', COALESCE(i.items, '[]'::jsonb),
    'pinned_comment', CASE
      WHEN c.pinned_comment_id IS NULL THEN NULL
      ELSE jsonb_build_object(
        'id', c.pinned_comment_id,
        'user_id', c.pinned_user_id,
        'username', c.pinned_username,
        'user_flair', c.pinned_user_flair,
        'body', c.pinned_body,
        'created_at', c.pinned_created_at,
        'edited', c.pinned_edited,
        'parent_body', c.parent_body,
        'parent_author', c.parent_author,
        'parent_flair', c.parent_flair,
        'parent_deleted', c.parent_deleted
      )
    END
  )
  INTO v_result
  FROM collection_data c
  LEFT JOIN collection_tags ct ON ct.collection_id = c.id
  LEFT JOIN items i ON TRUE;
  
  return v_result;

end;
$$;

CREATE TABLE public.collection_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  target_type target_type_enum,
  target_id uuid,

  submitted_by uuid NOT NULL REFERENCES public.users(id),
  submitted_at timestamptz NOT NULL DEFAULT now(),

  note text,
  submitter_note text,

  status text NOT NULL DEFAULT 'pending',

  reviewed_by uuid REFERENCES public.users(id),
  reviewed_at timestamptz
);

CREATE UNIQUE INDEX uniq_user_submission_collection
ON collection_submissions(collection_id, target_type, target_id, submitted_by)
WHERE status = 'pending';

CREATE INDEX idx_submission_collection_status
ON collection_submissions(collection_id, status, submitted_at DESC);

ALTER TABLE public.collection_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can submit published content to open collection"
ON public.collection_submissions
FOR INSERT
TO authenticated
WITH CHECK (
  submitted_by = auth.uid()

  AND EXISTS (
    SELECT 1
    FROM public.collections c
    WHERE c.id = collection_submissions.collection_id
      AND c.submission_mode = 'open'
  )

  AND (
    (
      collection_submissions.target_type = 'build'
      AND EXISTS (
        SELECT 1
        FROM public.builds b
        WHERE b.id = collection_submissions.target_id
          AND b.is_published = TRUE
      )
    )
    OR
    (
      collection_submissions.target_type = 'md_plan'
      AND EXISTS (
        SELECT 1
        FROM public.md_plans p
        WHERE p.id = collection_submissions.target_id
          AND p.is_published = TRUE
      )
    )
  )
);

CREATE POLICY "users can view their own submissions"
ON public.collection_submissions
FOR SELECT
TO authenticated
USING (
  submitted_by = auth.uid()
);

CREATE POLICY "collection owners can view submissions"
ON public.collection_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.collections c
    WHERE c.id = collection_submissions.collection_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "collection owners can update submissions"
ON public.collection_submissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.collections c
    WHERE c.id = collection_submissions.collection_id
      AND c.user_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.get_collection_submissions(
  p_collection_id uuid
)
RETURNS TABLE (
  submission_id uuid,
  collection_id uuid,
  target_type target_type_enum,
  target_id uuid,
  note text,
  submitter_note text,
  submitted_at timestamptz,
  submitter jsonb,
  data jsonb
)
LANGUAGE sql
SECURITY DEFINER
AS $$
WITH submissions AS (
  SELECT *
  FROM public.collection_submissions s
  WHERE s.collection_id = p_collection_id
    AND s.status = 'pending'
),

all_build_ids AS (
  SELECT DISTINCT target_id AS id
  FROM submissions
  WHERE target_type = 'build'
),

all_md_plan_ids AS (
  SELECT DISTINCT target_id AS id
  FROM submissions
  WHERE target_type = 'md_plan'
),

builds AS (
  SELECT *
  FROM public.get_filtered_builds_v8(
    build_id_filter := ARRAY(SELECT abi.id FROM all_build_ids abi),
    p_published := TRUE,
    limit_count := 1000,
    ignore_block_discovery := TRUE
  )
),

md_plans AS (
  SELECT *
  FROM public.search_md_plans_v1(
    plan_id_filter := ARRAY(SELECT ami.id FROM all_md_plan_ids ami),
    p_published := TRUE,
    p_limit := 1000,
    p_ignore_block_discovery := TRUE
  )
),

all_content AS (
  SELECT
    b.id,
    'build'::target_type_enum AS type,
    to_jsonb(b) AS data
  FROM builds b

  UNION ALL

  SELECT
    p.id,
    'md_plan'::target_type_enum AS type,
    to_jsonb(p) AS data
  FROM md_plans p
)

SELECT
  s.id AS submission_id,
  s.collection_id,
  s.target_type,
  s.target_id,
  s.note,
  s.submitter_note,
  s.submitted_at,

  jsonb_build_object(
    'user_id', s.submitted_by,
    'username', su.username,
    'flair', su.flair
  ) AS submitter,

  ac.data

FROM submissions s

LEFT JOIN all_content ac
  ON ac.id = s.target_id
 AND ac.type = s.target_type

LEFT JOIN public.users su
  ON su.id = s.submitted_by

ORDER BY s.submitted_at;
$$;

CREATE INDEX idx_collection_submissions_status ON collection_submissions(collection_id, status, submitted_at);

CREATE OR REPLACE FUNCTION public.approve_collection_submission(
  p_submission_id uuid,
  p_note text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_collection_id uuid;
  v_target_type target_type_enum;
  v_target_id uuid;
  v_submitted_by uuid;
  v_position int;
BEGIN

  -- lock the submission row
  SELECT
    collection_id,
    target_type,
    target_id,
    submitted_by
  INTO
    v_collection_id,
    v_target_type,
    v_target_id,
    v_submitted_by
  FROM public.collection_submissions
  WHERE id = p_submission_id
    AND status = 'pending'
  FOR UPDATE;

  IF v_collection_id IS NULL THEN
    RAISE EXCEPTION 'Submission not found or already reviewed';
  END IF;

  -- determine next position
  SELECT COALESCE(MAX(position) + 1, 1)
  INTO v_position
  FROM public.collection_items
  WHERE collection_id = v_collection_id;

  -- insert into collection
  INSERT INTO public.collection_items (
    collection_id,
    target_type,
    target_id,
    note,
    submitted_by,
    position
  )
  VALUES (
    v_collection_id,
    v_target_type,
    v_target_id,
    p_note,
    v_submitted_by,
    v_position
  );

  -- mark submission as approved
  UPDATE public.collection_submissions
  SET
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = p_submission_id;

  -- reject all other submissions of the same target
  UPDATE public.collection_submissions
  SET
    status = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE collection_id = v_collection_id
    AND target_type = v_target_type
    AND target_id = v_target_id
    AND status = 'pending';
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_collection_submission(
  p_submission_id uuid
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.collection_submissions
  SET
    status = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = p_submission_id
    AND status = 'pending'
$$;

CREATE OR REPLACE FUNCTION public.reject_collection_submissions_for_target(
  p_collection_id uuid,
  p_target_type target_type_enum,
  p_target_id uuid
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.collection_submissions
  SET
    status = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE collection_id = p_collection_id
    AND target_type = p_target_type
    AND target_id = p_target_id
    AND status = 'pending';
$$;

CREATE OR REPLACE FUNCTION handle_collection_submission_notifications()
RETURNS TRIGGER AS $$
DECLARE
  collection_owner UUID;
  existing_notif UUID;
BEGIN

  -- Get collection owner
  SELECT user_id INTO collection_owner
  FROM public.collections
  WHERE id = NEW.collection_id;

  -- Don't notify yourself
  IF collection_owner IS NULL OR collection_owner = NEW.submitted_by THEN
    RETURN NEW;
  END IF;

  -- Check existing unread notification
  SELECT id INTO existing_notif
  FROM public.notifications
  WHERE user_id = collection_owner
    AND target_type = 'collection'
    AND target_id = NEW.collection_id
    AND type = 'collection_submission'
    AND is_read = FALSE
  LIMIT 1;

  IF existing_notif IS NOT NULL THEN
    UPDATE public.notifications
    SET actor_ids = array_append(actor_ids, NEW.submitted_by),
        created_at = NOW()
    WHERE id = existing_notif
      AND NOT (NEW.submitted_by = ANY(actor_ids));
  ELSE
    INSERT INTO public.notifications (
      user_id,
      actor_ids,
      target_type,
      target_id,
      type
    )
    VALUES (
      collection_owner,
      ARRAY[NEW.submitted_by],
      'collection',
      NEW.collection_id,
      'collection_submission'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_collection_submission_notifications
AFTER INSERT ON public.collection_submissions
FOR EACH ROW
EXECUTE FUNCTION handle_collection_submission_notifications();

CREATE OR REPLACE FUNCTION handle_collection_submission_review_notifications()
RETURNS TRIGGER AS $$
DECLARE
  existing_notif UUID;
  notif_type notification_type_enum;
BEGIN

  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'approved' THEN
    notif_type := 'collection_submission_approved';
  ELSIF NEW.status = 'rejected' THEN
    notif_type := 'collection_submission_rejected';
  ELSE
    RETURN NEW;
  END IF;

  -- Don't notify yourself
  IF NEW.submitted_by IS NULL OR NEW.submitted_by = NEW.reviewed_by THEN
    RETURN NEW;
  END IF;

  -- Find existing notification
  SELECT id INTO existing_notif
  FROM public.notifications
  WHERE user_id = NEW.submitted_by
    AND target_type = 'collection'
    AND target_id = NEW.collection_id
    AND type = notif_type
    AND is_read = FALSE
  LIMIT 1;

  IF existing_notif IS NOT NULL THEN
    UPDATE public.notifications
    SET actor_ids = array_append(actor_ids, NEW.reviewed_by),
        created_at = NOW()
    WHERE id = existing_notif
      AND NOT (NEW.reviewed_by = ANY(actor_ids));
  ELSE
    INSERT INTO public.notifications (
      user_id,
      actor_ids,
      target_type,
      target_id,
      type
    )
    VALUES (
      NEW.submitted_by,
      ARRAY[NEW.reviewed_by],
      'collection',
      NEW.collection_id,
      notif_type
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_collection_submission_review_notifications
AFTER UPDATE OF status ON public.collection_submissions
FOR EACH ROW
EXECUTE FUNCTION handle_collection_submission_review_notifications();

CREATE OR REPLACE FUNCTION public.get_saved_collections(
  p_user_id UUID,
  p_sort_by text DEFAULT NULL,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  username TEXT,
  user_flair TEXT,
  title text,
  short_desc text,
  submission_mode collection_submission_mode,
  created_at timestamptz,
  published_at timestamptz,
  tags TEXT[],
  like_count INT,
  comment_count INT,
  items jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  saved_ids UUID[];
BEGIN
  -- get all saved collection IDs for the user
  SELECT COALESCE(ARRAY_AGG(target_id), ARRAY[]::UUID[])
  INTO saved_ids
  FROM public.saves s
  WHERE s.user_id = p_user_id
    AND target_type = 'collection';

  IF saved_ids = '{}' THEN
    RETURN;
  END IF;

  -- call search_collections with the filter
  RETURN QUERY
    SELECT *
    FROM public.search_collections_v1(
      p_query := NULL,
      collection_id_filter := saved_ids,
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
