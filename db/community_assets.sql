CREATE TYPE community_asset_type AS ENUM ('emoji', 'emote', 'sticker');

CREATE TABLE community_assets (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type community_asset_type NOT NULL,
  prefix TEXT NOT NULL,
  keywords TEXT NOT NULL DEFAULT '',
  search_vector TSVECTOR,
  created_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX community_assets_search_emote_idx
ON community_assets USING GIN (search_vector)
WHERE type = 'emote'::community_asset_type AND is_deleted = false;;

CREATE INDEX community_assets_search_sticker_idx
ON community_assets USING GIN (search_vector)
WHERE type = 'sticker'::community_asset_type AND is_deleted = false;;

CREATE INDEX community_assets_created_at_idx
ON community_assets (type, created_at DESC)
WHERE is_deleted = false;

CREATE INDEX community_assets_user_idx
ON community_assets (user_id, type, created_at DESC)
WHERE is_deleted = false;

CREATE INDEX community_assets_type_prefix_idx
ON community_assets (type, prefix)
WHERE is_deleted = false;

CREATE INDEX community_assets_active_idx
ON community_assets (type)
WHERE is_deleted = false;

ALTER TABLE community_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read community assets"
ON community_assets
FOR SELECT
USING (true);

CREATE POLICY "authenticated insert community assets"
ON community_assets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner update community assets"
ON community_assets
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "no hard delete of community assets"
ON community_assets
FOR DELETE
USING (false);

CREATE OR REPLACE FUNCTION create_community_asset(
  p_id TEXT,
  p_type community_asset_type,
  p_prefix TEXT,
  p_keywords TEXT
)
RETURNS VOID AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_vector TSVECTOR;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_moderation
    WHERE user_id = v_uid
      AND asset_upload_disabled_until > NOW()
  ) THEN
    RAISE EXCEPTION 'Asset uploads disabled';
  END IF;

  v_vector := to_tsvector(
    'english',
    coalesce(p_prefix,'') || ' ' || coalesce(p_keywords,'')
  );

  INSERT INTO community_assets (
    id,
    user_id,
    type,
    prefix,
    keywords,
    search_vector
  )
  VALUES (
    p_id,
    v_uid,
    p_type,
    p_prefix,
    p_keywords,
    v_vector
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_community_asset(
  p_id TEXT,
  p_prefix TEXT,
  p_keywords TEXT
)
RETURNS VOID AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_vector TSVECTOR;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE community_assets
  SET
    prefix = p_prefix,
    keywords = p_keywords,
    search_vector = to_tsvector(
      'english',
      coalesce(p_prefix,'') || ' ' || coalesce(p_keywords,'')
    )
  WHERE id = p_id
    AND user_id = v_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION search_community_assets(
  p_query TEXT,
  p_type community_asset_type DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id TEXT,
  -- type TEXT,
  prefix TEXT
) AS $$
DECLARE
  q TSQUERY;
BEGIN
  q := plainto_tsquery('english', p_query);

  RETURN QUERY
  SELECT
    a.id,
    -- a.type,
    a.prefix
  FROM community_assets a
  WHERE
    a.search_vector @@ q
    AND NOT a.is_deleted
    AND (p_type IS NULL OR a.type = p_type)
  ORDER BY
    (
      ts_rank(a.search_vector, q)
      + CASE
          WHEN a.prefix ILIKE p_query THEN 0.35
          WHEN a.prefix ILIKE p_query || '%' THEN 0.2
          WHEN a.prefix ILIKE '%' || p_query || '%' THEN 0.05
          ELSE 0
        END
    ) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;