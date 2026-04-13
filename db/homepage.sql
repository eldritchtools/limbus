CREATE TABLE public.homepage_showcase (
  id BIGSERIAL PRIMARY KEY,
  build_id UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  featured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_showcase
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read homepage showcase"
ON public.homepage_showcase
FOR SELECT
USING (true);

CREATE INDEX idx_homepage_showcase_featured_at
ON public.homepage_showcase (featured_at DESC);

CREATE OR REPLACE FUNCTION public.add_homepage_showcase_build()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  selected_build UUID;
BEGIN
  SELECT b.id
  INTO selected_build
  FROM public.builds b
  WHERE b.is_published = TRUE
    AND b.like_count >= 1
    AND b.block_discovery = FALSE
    AND b.id NOT IN (
      SELECT build_id
      FROM public.homepage_showcase
      ORDER BY featured_at DESC
      LIMIT 30
    )
  ORDER BY RANDOM()
  LIMIT 1;

  IF selected_build IS NOT NULL THEN
    INSERT INTO public.homepage_showcase (build_id)
    VALUES (selected_build);
  END IF;
END;
$$;

SELECT cron.schedule(
  'homepage-showcase-hourly',
  '0 * * * *',
  $$SELECT public.add_homepage_showcase_build();$$
);

CREATE OR REPLACE FUNCTION public.get_homepage_posts_v3(
  popular_limit INTEGER DEFAULT 3,
  newest_limit INTEGER DEFAULT 3,
  showcase_limit INTEGER DEFAULT 3,
  mdplans_limit INTEGER DEFAULT 3,
  collections_limit INTEGER DEFAULT 3
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'popular', (
      SELECT json_agg(p)
      FROM (
        SELECT *
        FROM public.get_popular_builds_v5(popular_limit, 0)
      ) p
    ),

    'newest', (
      SELECT json_agg(n)
      FROM (
        SELECT *
        FROM public.search_builds_v9(
          p_sort_by := 'new',
          p_limit := newest_limit,
          p_offset := 0
        )
      ) n
    ),

    'showcase', (
      SELECT json_agg(s ORDER BY array_position(ids.show_ids, s.id))
      FROM (
        SELECT array_agg(build_id) AS show_ids
        FROM (
          SELECT hs.build_id
          FROM public.homepage_showcase hs
          ORDER BY hs.featured_at DESC
          LIMIT showcase_limit
        ) top_show
      ) ids,
      LATERAL public.search_builds_v9(
        build_id_filter := ids.show_ids,
        p_limit := showcase_limit
      ) s
    ),

    'mdplans', (
      SELECT json_agg(m)
      FROM (
        SELECT *
        FROM public.search_md_plans_v3(
          p_sort_by := 'new',
          p_limit := mdplans_limit,
          p_offset := 0
        )
      ) m
    ),

    'collections', (
      SELECT json_agg(c)
      FROM (
        SELECT *
        FROM public.search_collections_v2(
          p_sort_by := 'new',
          p_limit := collections_limit,
          p_offset := 0
        )
      ) c
    )
  )
  INTO result;

  RETURN result;
END;
$$;
