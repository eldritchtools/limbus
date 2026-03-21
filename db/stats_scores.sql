CREATE OR REPLACE FUNCTION public.update_target_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    tgt_type target_type_enum;
    tgt_id UUID;

    target_table TEXT;

    like_delta INT := 0;
    comment_delta INT := 0;
BEGIN

    tgt_type := COALESCE(NEW.target_type, OLD.target_type);
    tgt_id   := COALESCE(NEW.target_id, OLD.target_id);

    target_table :=
        CASE tgt_type
            WHEN 'build' THEN 'builds'
            WHEN 'collection' THEN 'collections'
            WHEN 'md_plan' THEN 'md_plans'
        END;

    IF target_table IS NULL THEN
        RETURN NULL;
    END IF;

    -- Likes logic
    IF TG_TABLE_NAME = 'likes' THEN
        IF TG_OP = 'INSERT' THEN
            like_delta := 1;
        ELSIF TG_OP = 'DELETE' THEN
            like_delta := -1;
        END IF;
    END IF;

    -- Comments logic
    IF TG_TABLE_NAME = 'comments' THEN
        IF TG_OP = 'INSERT' AND NOT NEW.deleted THEN
            comment_delta := 1;
        ELSIF TG_OP = 'DELETE' AND NOT OLD.deleted THEN
            comment_delta := -1;
        ELSIF TG_OP = 'UPDATE' THEN
            IF OLD.deleted = FALSE AND NEW.deleted = TRUE THEN
                comment_delta := -1;
            ELSIF OLD.deleted = TRUE AND NEW.deleted = FALSE THEN
                comment_delta := 1;
            END IF;
        END IF;
    END IF;

    -- Apply deltas
    EXECUTE format(
        '
        UPDATE public.%I
        SET
            like_count = like_count + $1,
            comment_count = comment_count + $2,
            score =
                ((like_count + $1) * 2 + (comment_count + $2))
                /
                POWER(
                    (EXTRACT(EPOCH FROM (NOW() - COALESCE(published_at, created_at))) / 86400) + 2,
                    1.05
                )
        WHERE id = $3
        ',
        target_table
    )
    USING like_delta, comment_delta, tgt_id;

    RETURN NULL;

END;
$$;


CREATE TRIGGER trg_like_insert
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.update_target_stats();

CREATE TRIGGER trg_like_delete
AFTER DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.update_target_stats();

CREATE TRIGGER trg_comment_insert
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_target_stats();

CREATE TRIGGER trg_comment_delete
AFTER DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_target_stats();

CREATE TRIGGER trg_comment_update
AFTER UPDATE OF deleted ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_target_stats();
