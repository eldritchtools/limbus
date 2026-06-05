CREATE TABLE public.thread_activity (
  target_type target_type_enum NOT NULL,
  target_id UUID NOT NULL,

  last_comment_at TIMESTAMPTZ,
  last_comment_id UUID,
  comment_count BIGINT NOT NULL DEFAULT 0,

  subscriber_count INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  PRIMARY KEY (target_type, target_id)
);

CREATE TABLE public.thread_subscriptions (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type target_type_enum NOT NULL,
  target_id UUID NOT NULL,

  last_seen_comment_count BIGINT NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),

  PRIMARY KEY (user_id, target_type, target_id)
);

CREATE INDEX thread_subscriptions_user_idx
ON thread_subscriptions (user_id);

CREATE INDEX thread_activity_last_comment_idx
ON thread_activity (last_comment_at DESC);

CREATE OR REPLACE FUNCTION handle_thread_updates()
RETURNS trigger
SECURITY DEFINER
AS $$
BEGIN
  UPDATE thread_activity
  SET
    last_comment_at = now(),
    last_comment_id = NEW.id,
    comment_count = comment_count + 1
  WHERE target_type = NEW.target_type
    AND target_id = NEW.target_id;

  UPDATE thread_subscriptions ts
  SET last_seen_comment_count = ta.comment_count,
      last_seen_at = now()
  FROM thread_activity ta
  WHERE ts.user_id = NEW.user_id
    AND ts.target_type = NEW.target_type
    AND ts.target_id = NEW.target_id
    AND ta.target_type = NEW.target_type
    AND ta.target_id = NEW.target_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_update_thread_activity
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION handle_thread_updates();

CREATE OR REPLACE FUNCTION follow_thread(
  p_target_type target_type_enum,
  p_target_id UUID
)
RETURNS void AS $$
BEGIN
  -- 1. insert subscription
  INSERT INTO thread_subscriptions (
    user_id,
    target_type,
    target_id,
    last_seen_comment_count,
    last_seen_at
  )
  VALUES (
    auth.uid(),
    p_target_type,
    p_target_id,
    COALESCE(
      (SELECT comment_count
       FROM thread_activity
       WHERE target_type = p_target_type
         AND target_id = p_target_id),
      0
    ),
    now()
  )
  ON CONFLICT DO NOTHING;

  -- 2. increment subscriber count + create row if first follower
  INSERT INTO thread_activity (
    target_type,
    target_id,
    subscriber_count,
    last_comment_at,
    comment_count
  )
  VALUES (
    p_target_type,
    p_target_id,
    1,
    now(),
    0
  )
  ON CONFLICT (target_type, target_id)
  DO UPDATE SET
    subscriber_count = thread_activity.subscriber_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION unfollow_thread(
  p_target_type target_type_enum,
  p_target_id UUID
)
RETURNS void AS $$
BEGIN
  DELETE FROM thread_subscriptions
  WHERE user_id = auth.uid()
    AND target_type = p_target_type
    AND target_id = p_target_id;

  UPDATE thread_activity
  SET subscriber_count = subscriber_count - 1
  WHERE target_type = p_target_type
    AND target_id = p_target_id;

  DELETE FROM thread_activity
  WHERE target_type = p_target_type
    AND target_id = p_target_id
    AND subscriber_count <= 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_thread_read(
  p_target_type target_type_enum,
  p_target_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE thread_subscriptions ts
  SET
    last_seen_comment_count = s.comment_count,
    last_seen_at = now()
  FROM thread_activity s
  WHERE ts.user_id = auth.uid()
    AND ts.target_type = p_target_type
    AND ts.target_id = p_target_id
    AND s.target_type = ts.target_type
    AND s.target_id = ts.target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE thread_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read thread_activity"
ON thread_activity
FOR SELECT
USING (true);

CREATE POLICY "system writes thread_activity"
ON thread_activity
FOR ALL
USING (false)
WITH CHECK (false);

ALTER TABLE thread_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own subscriptions"
ON thread_subscriptions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "insert own subscriptions"
ON thread_subscriptions
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "delete own subscriptions"
ON thread_subscriptions
FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "no direct updates"
ON thread_subscriptions
FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE OR REPLACE FUNCTION get_user_bell_v1(
  p_user_id UUID,
  p_notification_limit INT DEFAULT 5
)
RETURNS JSONB
LANGUAGE sql
SECURITY INVOKER
AS $$
WITH notifications_data AS (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', n.id,
      'type', n.type,
      'actors', (
        SELECT ARRAY_AGG(u.username ORDER BY u.username)
        FROM users u
        WHERE u.id = ANY(n.actor_ids)
      ),
      'target_type', n.target_type,
      'target_id', n.target_id,
      'title', tm.title,
      'is_read', n.is_read,
      'created_at', n.created_at
    )
    ORDER BY n.created_at DESC
  ) AS notifications
  FROM (
    SELECT *
    FROM notifications
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT p_notification_limit
  ) n
  LEFT JOIN target_metadata tm
    ON tm.target_type = n.target_type
   AND tm.target_id = n.target_id
),

notification_count AS (
  SELECT COUNT(*)::int AS unread_notifications_count
  FROM notifications
  WHERE user_id = p_user_id
    AND is_read = false
),

following_data AS (
  SELECT jsonb_agg(
    jsonb_build_object(
      'target_type', ts.target_type,
      'target_id', ts.target_id,
      'title', tm.title,
      'last_comment_at', ta.last_comment_at,
      'unread_count',
        ta.comment_count - ts.last_seen_comment_count
    )
    ORDER BY ta.last_comment_at DESC
  ) AS following
  FROM thread_subscriptions ts
  JOIN thread_activity ta
    ON ta.target_type = ts.target_type
   AND ta.target_id = ts.target_id
  LEFT JOIN target_metadata tm
    ON tm.target_type = ts.target_type
   AND tm.target_id = ts.target_id
  WHERE ts.user_id = p_user_id
  LIMIT p_notification_limit
),

following_count AS (
  SELECT COUNT(*)::int AS unread_following_count
  FROM thread_subscriptions ts
  JOIN thread_activity ta
    ON ta.target_type = ts.target_type
   AND ta.target_id = ts.target_id
  WHERE ts.user_id = p_user_id
    AND ta.comment_count > ts.last_seen_comment_count
)

SELECT jsonb_build_object(
  'notifications',
    COALESCE(
      (SELECT notifications FROM notifications_data),
      '[]'::jsonb
    ),

  'unread_notifications_count',
    COALESCE(
      (SELECT unread_notifications_count FROM notification_count),
      0
    ),

  'following',
    COALESCE(
      (SELECT following FROM following_data),
      '[]'::jsonb
    ),

  'unread_following_count',
    COALESCE(
      (SELECT unread_following_count FROM following_count),
      0
    )
);
$$;

CREATE OR REPLACE FUNCTION get_user_followed_threads(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  target_type target_type_enum,
  target_id UUID,
  title TEXT,
  last_comment_at TIMESTAMPTZ,
  unread_count INT
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT
    ts.target_type,
    ts.target_id,
    tm.title,
    ta.last_comment_at,
    (ta.comment_count - ts.last_seen_comment_count) AS unread_count
  FROM thread_subscriptions ts
  JOIN thread_activity ta
    ON ta.target_type = ts.target_type
   AND ta.target_id = ts.target_id
  LEFT JOIN target_metadata tm
    ON tm.target_type = ts.target_type
   AND tm.target_id = ts.target_id
  WHERE ts.user_id = p_user_id
  ORDER BY ta.last_comment_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;