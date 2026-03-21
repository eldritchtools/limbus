CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_ids UUID[] DEFAULT '{}',
  target_type target_type_enum,
  target_id UUID,
  type TEXT NOT NULL CHECK (type IN ('comment', 'reply')),
  parent_comment_id UUID REFERENCES comments(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE notification_type_enum AS ENUM (
  'comment',
  'reply',
  'collection_submission',
  'collection_submission_approved',
  'collection_submission_rejected'
);

CREATE OR REPLACE FUNCTION handle_comment_notifications()
RETURNS TRIGGER AS $$
DECLARE
  target_owner UUID;
  parent_owner UUID;
  existing_notif UUID;
  tgt_type target_type_enum;
  tgt_id UUID;
BEGIN
  tgt_type := NEW.target_type;
  tgt_id   := NEW.target_id;

  -- ========================
  -- Get owner of target
  -- ========================
  IF tgt_type = 'build' THEN
    SELECT user_id INTO target_owner FROM public.builds WHERE id = tgt_id;
  ELSIF tgt_type = 'collection' THEN
    SELECT user_id INTO target_owner FROM public.collections WHERE id = tgt_id;
  ELSIF tgt_type = 'md_plan' THEN
    SELECT user_id INTO target_owner FROM public.md_plans WHERE id = tgt_id;
  END IF;

  -- ========================
  -- Parent comment owner
  -- ========================
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_owner FROM public.comments WHERE id = NEW.parent_id;
  END IF;

  -- ========================
  -- 1. Notify build owner
  -- ========================
  IF target_owner IS NOT NULL AND target_owner != NEW.user_id THEN
    SELECT id INTO existing_notif
    FROM public.notifications
    WHERE user_id = target_owner
      AND target_type = tgt_type
      AND target_id = tgt_id
      AND type = 'comment'
      AND is_read = FALSE
    LIMIT 1;

    IF existing_notif IS NOT NULL THEN
      UPDATE public.notifications
      SET actor_ids = array_append(actor_ids, NEW.user_id),
          created_at = NOW()
      WHERE id = existing_notif
        AND NOT (NEW.user_id = ANY(actor_ids));
    ELSE
      INSERT INTO notifications (user_id, actor_ids, target_type, target_id, type)
      VALUES (target_owner, ARRAY[NEW.user_id], tgt_type, tgt_id, 'comment');
    END IF;
  END IF;

  -- ========================
  -- 2. Notify parent comment owner (for replies)
  -- ========================
  IF NEW.parent_id IS NOT NULL 
     AND parent_owner IS NOT NULL
     AND parent_owner != NEW.user_id
     AND parent_owner != target_owner THEN

    SELECT id INTO existing_notif
    FROM notifications
    WHERE user_id = parent_owner
      AND target_type = tgt_type
      AND target_id = tgt_id
      AND parent_comment_id = NEW.parent_id
      AND type = 'reply'
      AND is_read = FALSE
    LIMIT 1;

    IF existing_notif IS NOT NULL THEN
      UPDATE notifications
      SET actor_ids = array_append(actor_ids, NEW.user_id),
          created_at = NOW()
      WHERE id = existing_notif
        AND NOT (NEW.user_id = ANY(actor_ids));
    ELSE
      INSERT INTO notifications (user_id, actor_ids, target_type, target_id, parent_comment_id, type)
      VALUES (parent_owner, ARRAY[NEW.user_id], tgt_type, tgt_id, NEW.parent_id, 'reply');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_comment_notifications ON public.comments;

CREATE TRIGGER trigger_comment_notifications
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION handle_comment_notifications();

CREATE OR REPLACE FUNCTION public.get_user_notifications_v3(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  type notification_type_enum,
  actors TEXT[],
  target_type target_type_enum,
  target_id UUID,
  title TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT
    n.id,
    n.type,
    ARRAY_AGG(DISTINCT a.username ORDER BY a.username) AS actors,
    n.target_type,
    n.target_id,
    COALESCE(b.title, c.title, p.title) AS title,
    n.is_read,
    n.created_at
  FROM public.notifications AS n

  LEFT JOIN public.builds b
    ON n.target_type = 'build'
   AND b.id = n.target_id

  LEFT JOIN public.collections c
    ON n.target_type = 'collection'
   AND c.id = n.target_id

  LEFT JOIN public.md_plans p
    ON n.target_type = 'md_plan'
   AND p.id = n.target_id
   
  LEFT JOIN LATERAL (
    SELECT u.username
    FROM public.users AS u
    WHERE u.id = ANY(n.actor_ids)
  ) AS a ON TRUE
  WHERE n.user_id = p_user_id
  GROUP BY n.id, n.type, n.target_type, n.target_id, b.title, c.title, p.title, n.is_read, n.created_at
  ORDER BY n.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_user_target_type ON notifications (user_id, target_type, created_at DESC);
CREATE INDEX idx_notifications_lookup ON notifications (user_id, target_type, target_id, type) WHERE is_read = FALSE;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their own notifications as read"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


CREATE OR REPLACE FUNCTION public.cleanup_old_notifications(
  p_days_old INT DEFAULT 30
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE is_read = TRUE
    AND created_at < NOW() - (p_days_old || ' days')::INTERVAL;

  RAISE NOTICE 'Old notifications cleaned up (older than % days)', p_days_old;
END;
$$;

SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 0 * * *',
  $$SELECT public.cleanup_old_notifications(30);$$
);