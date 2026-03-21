CREATE TABLE public.popular_builds_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  ranking_type TEXT DEFAULT 'all_time', -- 'all_time', 'weekly', etc.
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_popular_builds_cache_score ON public.popular_builds_cache (score DESC);
CREATE INDEX idx_popular_builds_cache_computed_at ON public.popular_builds_cache (computed_at DESC);
CREATE INDEX idx_popular_builds_cache_ranking_type ON public.popular_builds_cache (ranking_type);

ALTER TABLE public.popular_builds_cache ENABLE ROW LEVEL SECURITY;

-- Public read access for cached results
CREATE POLICY "Public can read popular builds cache"
ON public.popular_builds_cache
FOR SELECT
USING (true);

-- Only the backend or cron job (service role) can modify cache entries
CREATE POLICY "Admins can manage popular builds cache"
ON public.popular_builds_cache
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can update popular builds cache"
ON public.popular_builds_cache
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can delete popular builds cache"
ON public.popular_builds_cache
FOR DELETE
USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.refresh_popular_builds_cache()
RETURNS void AS $$
BEGIN
  -- Wipe old entries for this ranking type (optional)
  DELETE FROM public.popular_builds_cache WHERE ranking_type = 'recent';

  -- Insert top builds
  INSERT INTO public.popular_builds_cache (
    build_id, score, ranking_type, computed_at
  )
  SELECT
    b.id,
    b.score,
    'recent' AS ranking_type,
    NOW() AS computed_at
  FROM public.builds b
  WHERE b.is_published AND b.block_discovery = false
  ORDER BY b.score DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_popular_builds_v5(p_limit INTEGER, p_offset INTEGER)
RETURNS TABLE (
  id UUID,
  username TEXT,
  user_flair TEXT,
  title TEXT,
  score NUMERIC,
  deployment_order INTEGER[],
  active_sinners INTEGER,
  like_count INTEGER,
  comment_count INTEGER,
  created_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  identity_ids INTEGER[],
  ego_ids INTEGER[],
  keyword_ids INTEGER[],
  tags TEXT[],
  extra_opts TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.build_id,
    u.username,
    u.flair,
    b.title,
    b.score,
    b.deployment_order,
    b.active_sinners,
    b.like_count,
    b.comment_count,
    b.created_at,
    b.published_at,
    b.identity_ids,
    b.ego_ids,
    b.keyword_ids,
    COALESCE((
      SELECT array_agg(t.name)
      FROM public.build_tags bt
      JOIN public.tags t ON bt.tag_id = t.id
      WHERE bt.build_id = b.id
    ), ARRAY[]::text[]) AS tags,
    b.extra_opts
  FROM popular_builds_cache p
  JOIN builds b ON p.build_id = b.id
  JOIN users u ON b.user_id = u.id
  WHERE p.ranking_type = 'recent'
  ORDER BY p.score DESC
  OFFSET p_offset
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
