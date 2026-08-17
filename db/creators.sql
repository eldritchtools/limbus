CREATE TABLE public.creators (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_id UUID,
    platforms JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_variety BOOLEAN NOT NULL DEFAULT FALSE,
    voter_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_creators_name ON public.creators (name);

ALTER TABLE public.creators
ADD CONSTRAINT creator_name_length CHECK (char_length(name) BETWEEN 1 AND 100);

ALTER TABLE public.creators
ADD CONSTRAINT creator_voter_count_nonnegative CHECK (voter_count >= 0);

ALTER TABLE public.creators
ADD CONSTRAINT creator_platforms_is_array CHECK (jsonb_typeof(platforms) = 'array');

ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read creators"
ON public.creators
FOR SELECT
USING (true);

CREATE TABLE public.creator_tag_votes (
    creator_id INTEGER NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tag_ids INTEGER[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (creator_id, user_id)
);

CREATE INDEX idx_creator_tag_votes_user_creator ON public.creator_tag_votes (user_id, creator_id);

ALTER TABLE public.creator_tag_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own creator tag votes"
ON public.creator_tag_votes
FOR SELECT
USING (auth.uid() = user_id);

CREATE TABLE public.creator_tag_stats (
    creator_id INTEGER NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL,
    vote_count INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (creator_id, tag_id)
);

CREATE INDEX idx_creator_tag_stats_tag_creator ON public.creator_tag_stats (tag_id, creator_id);

ALTER TABLE public.creator_tag_stats
ADD CONSTRAINT creator_tag_stats_vote_count_nonnegative
CHECK (vote_count >= 0);

ALTER TABLE public.creator_tag_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read creator tag stats"
ON public.creator_tag_stats
FOR SELECT
USING (true);

CREATE OR REPLACE FUNCTION public.submit_creator_tag_votes(
    p_creator_id INTEGER,
    p_tag_ids INTEGER[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_old_tag_ids INTEGER[];
    v_new_tag_ids INTEGER[];
    v_added_tag_ids INTEGER[];
    v_removed_tag_ids INTEGER[];
    v_old_count INTEGER;
    v_new_count INTEGER;
    v_tag_id INTEGER;
    v_creator_id INTEGER;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT id
    INTO v_creator_id
    FROM public.creators
    WHERE id = p_creator_id
    FOR UPDATE;

    IF v_creator_id IS NULL THEN
        RAISE EXCEPTION 'Creator not found';
    END IF;

    -- Normalize NULL to an empty array, then sort and deduplicate.
    SELECT COALESCE(ARRAY_AGG(tag_id ORDER BY tag_id), '{}'::INTEGER[])
    INTO v_new_tag_ids
    FROM (
        SELECT DISTINCT tag_id
        FROM UNNEST(COALESCE(p_tag_ids, '{}'::INTEGER[])) AS tag_id
    ) AS tags;

    -- Validate creator tag IDs.
    IF EXISTS (
        SELECT 1
        FROM UNNEST(v_new_tag_ids) AS tag_id
        WHERE tag_id < 1 OR tag_id > 10
    ) THEN
        RAISE EXCEPTION 'Invalid creator tag';
    END IF;

    -- Get the user's existing submission.
    SELECT tag_ids
    INTO v_old_tag_ids
    FROM public.creator_tag_votes
    WHERE creator_id = p_creator_id
      AND user_id = v_user_id
    FOR UPDATE;

    v_old_tag_ids := COALESCE(v_old_tag_ids, '{}'::INTEGER[]);

    v_old_count := cardinality(v_old_tag_ids);
    v_new_count := cardinality(v_new_tag_ids);

    -- Tags newly added.
    SELECT COALESCE(ARRAY_AGG(tag_id ORDER BY tag_id), '{}'::INTEGER[])
    INTO v_added_tag_ids
    FROM UNNEST(v_new_tag_ids) AS tag_id
    WHERE NOT (tag_id = ANY(v_old_tag_ids));

    -- Tags removed.
    SELECT COALESCE(ARRAY_AGG(tag_id ORDER BY tag_id), '{}'::INTEGER[])
    INTO v_removed_tag_ids
    FROM UNNEST(v_old_tag_ids) AS tag_id
    WHERE NOT (tag_id = ANY(v_new_tag_ids));

    -- Update aggregate counts for newly added tags.
    FOREACH v_tag_id IN ARRAY v_added_tag_ids
    LOOP
        INSERT INTO public.creator_tag_stats (creator_id, tag_id,vote_count)
        VALUES (p_creator_id, v_tag_id, 1)
        ON CONFLICT (creator_id, tag_id)
        DO UPDATE SET
            vote_count = public.creator_tag_stats.vote_count + 1;
    END LOOP;

    -- Update aggregate counts for removed tags.
    FOREACH v_tag_id IN ARRAY v_removed_tag_ids
    LOOP
        UPDATE public.creator_tag_stats
        SET vote_count = vote_count - 1
        WHERE creator_id = p_creator_id
          AND tag_id = v_tag_id;

        DELETE FROM public.creator_tag_stats
        WHERE creator_id = p_creator_id
          AND tag_id = v_tag_id
          AND vote_count = 0;
    END LOOP;

    -- Update the number of users who have submitted at least one tag.
    IF v_old_count = 0 AND v_new_count > 0 THEN
        UPDATE public.creators
        SET voter_count = voter_count + 1,
            updated_at = NOW()
        WHERE id = p_creator_id;

    ELSIF v_old_count > 0 AND v_new_count = 0 THEN
        UPDATE public.creators
        SET voter_count = voter_count - 1,
            updated_at = NOW()
        WHERE id = p_creator_id;
    END IF;

    -- Empty submission means the user no longer has a vote row.
    IF v_new_count = 0 THEN
        DELETE FROM public.creator_tag_votes
        WHERE creator_id = p_creator_id
          AND user_id = v_user_id;
    ELSE
        INSERT INTO public.creator_tag_votes (creator_id, user_id, tag_ids, updated_at)
        VALUES (p_creator_id, v_user_id, v_new_tag_ids, NOW())
        ON CONFLICT (creator_id, user_id)
        DO UPDATE SET
            tag_ids = EXCLUDED.tag_ids,
            updated_at = NOW();
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_creator_tag_votes(INTEGER, INTEGER[])
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_creator_tag_votes(INTEGER, INTEGER[])
TO authenticated;

CREATE OR REPLACE FUNCTION public.search_creators(
    p_search TEXT DEFAULT NULL,
    p_tag_ids INTEGER[] DEFAULT NULL,
    p_is_variety BOOLEAN DEFAULT NULL,
    p_tag_threshold NUMERIC DEFAULT 0.30,
    p_limit INTEGER DEFAULT 24
)
RETURNS TABLE (
    id INTEGER,
    name TEXT,
    avatar_id UUID,
    platforms JSONB,
    is_variety BOOLEAN,
    voter_count INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    qualified_tag_ids INTEGER[]
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT
        c.id,
        c.name,
        c.avatar_id,
        c.platforms,
        c.is_variety,
        c.voter_count,
        c.created_at,
        c.updated_at,
        COALESCE(tags.tag_ids, '{}'::INTEGER[]) AS qualified_tag_ids
    FROM public.creators c

    LEFT JOIN LATERAL (
        SELECT ARRAY_AGG(s.tag_id ORDER BY s.tag_id) AS tag_ids
        FROM public.creator_tag_stats s
        WHERE s.creator_id = c.id
          AND s.vote_count >= c.voter_count * p_tag_threshold
    ) tags ON true

    WHERE
        (p_search IS NULL OR p_search = '' OR c.name ILIKE '%' || p_search || '%')
        AND (p_is_variety IS NULL OR c.is_variety = p_is_variety)
        AND (
            p_tag_ids IS NULL
            OR cardinality(p_tag_ids) = 0
            OR NOT EXISTS (
                SELECT 1
                FROM UNNEST(p_tag_ids) AS requested_tag
                WHERE NOT (requested_tag = ANY(
                    COALESCE(tags.tag_ids, '{}'::INTEGER[])
                ))
            )
        )

        AND p_tag_threshold BETWEEN 0 AND 1

    ORDER BY RANDOM()

    LIMIT LEAST(GREATEST(p_limit, 1), 100);
$$;

REVOKE ALL ON FUNCTION public.search_creators(TEXT, INTEGER[], BOOLEAN, NUMERIC, INTEGER)
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.search_creators(TEXT, INTEGER[], BOOLEAN, NUMERIC, INTEGER)
TO anon, authenticated;

CREATE TABLE public.creator_requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    links TEXT[] NOT NULL DEFAULT '{}',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_creator_requests_created_at ON public.creator_requests (created_at);

ALTER TABLE public.creator_requests
ADD CONSTRAINT creator_request_name_length CHECK (char_length(name) BETWEEN 1 AND 100);

ALTER TABLE public.creator_requests ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.submit_creator_request(
    p_name TEXT,
    p_links TEXT[],
    p_note TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_name IS NULL OR char_length(trim(p_name)) = 0 THEN
        RAISE EXCEPTION 'Creator name is required';
    END IF;

    IF p_links IS NULL OR cardinality(p_links) = 0 THEN
        RAISE EXCEPTION 'At least one link is required';
    END IF;

    INSERT INTO public.creator_requests (name, links, note)
    VALUES (trim(p_name), p_links, NULLIF(trim(p_note), ''));
END;
$$;

REVOKE ALL ON FUNCTION public.submit_creator_request(TEXT, TEXT[], TEXT)
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_creator_request(TEXT, TEXT[], TEXT)
TO anon, authenticated;