CREATE TABLE public.trivia_questions (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    question text NOT NULL,
    answer text NOT NULL,
    answer_type text NOT NULL DEFAULT 'short_answer' CHECK (answer_type IN ('short_answer', 'multiple_choice')),
    other_answers text[] NOT NULL DEFAULT '{}',
    explanation text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT trivia_questions_content_check CHECK (length(trim(question)) > 0 AND length(trim(answer)) > 0)
);

CREATE INDEX trivia_questions_status_idx ON public.trivia_questions (status);
CREATE INDEX trivia_questions_user_id_idx ON public.trivia_questions (user_id);

ALTER TABLE public.trivia_questions
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (to_tsvector('english', coalesce(question, ''))) STORED;
CREATE INDEX trivia_questions_search_idx ON public.trivia_questions USING GIN (search_vector);

REVOKE INSERT, UPDATE, DELETE ON public.trivia_questions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.trivia_questions TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.search_trivia_questions(
    p_query text,
    p_limit integer DEFAULT 10
)
RETURNS TABLE (
    id bigint,
    question text,
    answer text,
    status text,
    rank real
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
    SELECT
        q.id,
        q.question,
        q.answer,
        q.status,
        ts_rank(q.search_vector, websearch_to_tsquery('english', p_query)) AS rank
    FROM public.trivia_questions AS q
    WHERE
        q.status IN ('accepted', 'pending')
        AND nullif(trim(p_query), '') IS NOT NULL
        AND q.search_vector @@ websearch_to_tsquery('english', p_query)
    ORDER BY rank DESC, q.id DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 10), 20));
$$;

REVOKE ALL ON FUNCTION public.search_trivia_questions(text, integer)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.search_trivia_questions(text, integer)
TO anon, authenticated;

CREATE TABLE public.trivia_reports (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_id bigint NOT NULL REFERENCES public.trivia_questions(id) ON DELETE CASCADE,
    reporter_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    reason text NOT NULL CHECK (
        reason IN (
            'incorrect_answer',
            'ambiguous',
            'inappropriate',
            'duplicate',
            'outdated',
            'other'
        )
    ),
    details text,
    created_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz,
    resolved_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX trivia_reports_question_id_idx ON public.trivia_reports (question_id);
CREATE INDEX trivia_reports_unresolved_idx ON public.trivia_reports (created_at) WHERE resolved_at IS NULL;

REVOKE ALL ON public.trivia_reports FROM PUBLIC, anon, authenticated;

ALTER TABLE public.trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read available trivia questions"
    ON public.trivia_questions
    FOR SELECT
    TO anon, authenticated
    USING (status IN ('pending', 'accepted'));

CREATE OR REPLACE FUNCTION public.submit_trivia_question(
    p_question text,
    p_answer text,
    p_answer_type text,
    p_other_answers text[] DEFAULT '{}',
    p_explanation text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_question_id bigint;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
    END IF;

    INSERT INTO public.trivia_questions (
        user_id,
        question,
        answer,
        answer_type,
        other_answers,
        explanation,
        status
    )
    VALUES (
        auth.uid(),
        trim(p_question),
        trim(p_answer),
        p_answer_type,
        COALESCE(p_other_answers, '{}'),
        NULLIF(trim(p_explanation), ''),
        'pending'
    )
    RETURNING id INTO v_question_id;

    RETURN v_question_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_trivia_question(text, text, text, text[], text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_trivia_question(text, text, text, text[], text) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_trivia_report(
    p_question_id bigint,
    p_reason text,
    p_details text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_report_id bigint;
BEGIN
    IF p_reason IS NULL OR p_reason NOT IN (
        'incorrect_answer',
        'ambiguous',
        'inappropriate',
        'duplicate',
        'outdated',
        'other'
    ) THEN
        RAISE EXCEPTION 'Invalid report reason';
    END IF;

    IF p_details IS NOT NULL AND length(p_details) > 2000 THEN
        RAISE EXCEPTION 'Report details cannot exceed 2000 characters';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.trivia_questions q
        WHERE q.id = p_question_id AND q.status IN ('pending', 'accepted')
    ) THEN
        RAISE EXCEPTION 'Question not found or unavailable';
    END IF;

    INSERT INTO public.trivia_reports (
        question_id,
        reporter_id,
        reason,
        details
    )
    VALUES (
        p_question_id,
        auth.uid(),
        p_reason,
        NULLIF(trim(p_details), '')
    )
    RETURNING id INTO v_report_id;

    RETURN v_report_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_trivia_report(bigint, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_trivia_report(bigint, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_random_trivia_questions(
    p_mode text DEFAULT 'curated',
    p_limit integer DEFAULT 10
)
RETURNS TABLE (
    id bigint,
    question text,
    answer text,
    answer_type text,
    other_answers text[],
    explanation text,
    status text,
    created_at timestamptz,
    username text
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF p_mode IS NULL OR p_mode NOT IN ('curated', 'community') THEN
        RAISE EXCEPTION 'Invalid trivia question mode';
    END IF;

    RETURN QUERY
    SELECT
        q.id,
        q.question,
        q.answer,
        q.answer_type,
        q.other_answers,
        q.explanation,
        q.status,
        q.created_at,
        u.username
    FROM public.trivia_questions AS q
    LEFT JOIN public.users AS u ON u.id = q.user_id
    WHERE q.status = 'accepted' OR (p_mode = 'community' AND q.status = 'pending')
    ORDER BY random()
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 20), 100));
END;
$$;

REVOKE ALL ON FUNCTION public.get_random_trivia_questions(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_random_trivia_questions(text, integer) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_pending_trivia_questions(
    p_limit integer default 10
)
RETURNS TABLE (
    id bigint,
    user_id uuid,
    question text,
    answer text,
    answer_type text,
    other_answers text[],
    explanation text,
    status text,
    created_at timestamptz,
    updated_at timestamptz,
    username text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.is_admin IS TRUE
    ) THEN
        RAISE EXCEPTION 'Admin access required'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        q.id,
        q.user_id,
        q.question,
        q.answer,
        q.answer_type,
        q.other_answers,
        q.explanation,
        q.status,
        q.created_at,
        q.updated_at,
        u.username
    FROM public.trivia_questions q
    LEFT JOIN public.users u ON u.id = q.user_id
    WHERE q.status = 'pending'
    ORDER BY q.created_at ASC
    LIMIT p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.get_pending_trivia_questions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_trivia_questions() TO authenticated;

CREATE OR REPLACE FUNCTION public.moderate_trivia_question(
    p_question_id bigint,
    p_action text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_status text;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.is_admin IS TRUE
    ) THEN
        RAISE EXCEPTION 'Admin access required'
            USING ERRCODE = '42501';
    END IF;

    IF p_action IS NULL OR p_action NOT IN ('accept', 'reject') THEN
        RAISE EXCEPTION 'Action must be accept or reject';
    END IF;

    v_status := CASE p_action
        WHEN 'accept' THEN 'accepted'
        WHEN 'reject' THEN 'rejected'
    END;

    UPDATE public.trivia_questions
    SET status = v_status,
        updated_at = now()
    WHERE id = p_question_id;
END;
$$;

REVOKE ALL ON FUNCTION public.moderate_trivia_question(bigint, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.moderate_trivia_question(bigint, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_trivia_reports(
    p_limit integer default 10
)
RETURNS TABLE (
    report_id bigint,
    question_id bigint,
    reporter_id uuid,
    reporter text,
    reason text,
    details text,
    reported_at timestamptz,
    author text,
    question_text text,
    answer text,
    answer_type text,
    other_answers text[],
    question_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.is_admin IS TRUE
    ) THEN
        RAISE EXCEPTION 'Admin access required'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        r.id,
        r.question_id,
        r.reporter_id,
        reporter.username,
        r.reason,
        r.details,
        r.created_at,
        author.username,
        q.question,
        q.answer,
        q.answer_type,
        q.other_answers,
        q.status
    FROM public.trivia_reports r
    JOIN public.trivia_questions q ON q.id = r.question_id
    LEFT JOIN public.users reporter ON reporter.id = r.reporter_id
    LEFT JOIN public.users author ON author.id = q.user_id
    WHERE r.resolved_at IS NULL
    ORDER BY r.created_at ASC
    LIMIT p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.get_trivia_reports() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trivia_reports() TO authenticated;

CREATE OR REPLACE FUNCTION public.resolve_trivia_report(
    p_report_id bigint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.is_admin IS TRUE
    ) THEN
        RAISE EXCEPTION 'Admin access required'
            USING ERRCODE = '42501';
    END IF;

    UPDATE public.trivia_reports
    SET resolved_at = now(),
        resolved_by = auth.uid()
    WHERE id = p_report_id AND resolved_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unresolved report not found';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_trivia_report(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_trivia_report(bigint) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_trivia_question(
    p_question_id bigint,
    p_question text,
    p_answer text,
    p_answer_type text,
    p_other_answers text[] DEFAULT '{}',
    p_explanation text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.is_admin IS TRUE
    ) THEN
        RAISE EXCEPTION 'Admin access required'
            USING ERRCODE = '42501';
    END IF;

    UPDATE public.trivia_questions
    SET question = trim(p_question),
        answer = trim(p_answer),
        answer_type = p_answer_type,
        other_answers = COALESCE(p_other_answers, '{}'),
        explanation = NULLIF(trim(p_explanation), ''),
        updated_at = now()
    WHERE id = p_question_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_trivia_question(bigint, text, text, text, text[], text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_trivia_question(bigint, text, text, text, text[], text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_trivia_question_counts()
RETURNS TABLE (
    curated_count bigint,
    community_count bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
    SELECT
        count(*) FILTER (WHERE status = 'accepted'),
        count(*) FILTER (WHERE status IN ('accepted', 'pending'))
    FROM public.trivia_questions;
$$;

REVOKE ALL ON FUNCTION public.get_trivia_question_counts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trivia_question_counts() TO anon, authenticated;