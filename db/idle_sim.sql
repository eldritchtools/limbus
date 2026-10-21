CREATE TABLE public.idle_game_saves (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    save_version SMALLINT NOT NULL DEFAULT 1,
    save_data TEXT NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.idle_game_saves ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.idle_game_saves FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.load_idle_game_save()
RETURNS TABLE (
    save_version SMALLINT,
    save_data TEXT,
    revision INTEGER,
    updated_at TIMESTAMPTZ,
    server_time TIMESTAMPTZ,
    server_tick BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_server_time TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    v_server_time := clock_timestamp();

    RETURN QUERY
    SELECT
        s.save_version,
        s.save_data,
        s.revision,
        s.updated_at,
        v_server_time,
        FLOOR(EXTRACT(EPOCH FROM v_server_time) / 3600)::BIGINT
    FROM public.idle_game_saves AS s
    WHERE s.user_id = v_user_id;

    IF NOT FOUND THEN
        RETURN QUERY
        SELECT
            NULL::SMALLINT,
            NULL::TEXT,
            NULL::INTEGER,
            NULL::TIMESTAMPTZ,
            v_server_time,
            FLOOR(EXTRACT(EPOCH FROM v_server_time) / 3600)::BIGINT;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_idle_game_save(
    p_save_version SMALLINT,
    p_save_data TEXT,
    p_expected_revision INTEGER
)
RETURNS TABLE (
    new_revision INTEGER,
    updated_at TIMESTAMPTZ,
    server_time TIMESTAMPTZ,
    server_tick BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_revision INTEGER;
    v_server_time TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_save_version IS NULL OR p_save_version < 1 THEN
        RAISE EXCEPTION 'Invalid save version';
    END IF;

    IF p_save_data IS NULL OR p_save_data = '' THEN
        RAISE EXCEPTION 'Save data cannot be empty';
    END IF;

    IF p_expected_revision IS NOT NULL AND p_expected_revision < 1 THEN
        RAISE EXCEPTION 'Invalid expected revision';
    END IF;

    IF length(p_save_data) > 200000 THEN
        RAISE EXCEPTION 'Save data too large';
    END IF;

    IF p_expected_revision IS NULL THEN
        INSERT INTO public.idle_game_saves (
            user_id,
            save_version,
            save_data,
            revision,
            updated_at
        )
        VALUES (
            v_user_id,
            p_save_version,
            p_save_data,
            1,
            clock_timestamp()
        )
        ON CONFLICT (user_id) DO NOTHING
        RETURNING revision INTO v_revision;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Save already exists; reload before saving';
        END IF;
    ELSE
        UPDATE public.idle_game_saves AS s
        SET
            save_version = p_save_version,
            save_data = p_save_data,
            revision = s.revision + 1,
            updated_at = clock_timestamp()
        WHERE s.user_id = v_user_id AND s.revision = p_expected_revision
        RETURNING s.revision INTO v_revision;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Save revision conflict; reload before saving';
        END IF;
    END IF;

    v_server_time := clock_timestamp();

    RETURN QUERY
    SELECT
        v_revision,
        v_server_time,
        v_server_time,
        FLOOR(EXTRACT(EPOCH FROM v_server_time) / 3600)::BIGINT;
END;
$$;

REVOKE ALL ON FUNCTION public.load_idle_game_save() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.load_idle_game_save() FROM anon;
GRANT EXECUTE ON FUNCTION public.load_idle_game_save() TO authenticated;

REVOKE ALL ON FUNCTION public.save_idle_game_save(SMALLINT, TEXT, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_idle_game_save(SMALLINT, TEXT, INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION public.save_idle_game_save(SMALLINT, TEXT, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.reset_idle_game_save()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    DELETE FROM public.idle_game_saves
    WHERE user_id = (SELECT auth.uid());
$$;

REVOKE ALL ON FUNCTION public.reset_idle_game_save() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reset_idle_game_save() FROM anon;
GRANT EXECUTE ON FUNCTION public.reset_idle_game_save() TO authenticated;