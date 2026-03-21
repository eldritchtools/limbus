CREATE TABLE public.tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON public.tags (name);

ALTER TABLE public.tags
ADD CONSTRAINT tag_length CHECK (char_length(name) BETWEEN 1 AND 50);

ALTER TABLE public.tags
ADD CONSTRAINT tag_format CHECK (name ~ '^[A-Za-z0-9 -]+$');

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Everyone can view tags
CREATE POLICY "Public can read tags"
ON public.tags
FOR SELECT
USING (true);

-- Authenticated users can create new tags
CREATE POLICY "Authenticated users can create tags"
ON public.tags
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Only admins can update or delete tags
CREATE POLICY "Admins can update tags"
ON public.tags
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can delete tags"
ON public.tags
FOR DELETE
USING (auth.role() = 'service_role');


CREATE TABLE public.build_tags (
  build_id UUID REFERENCES public.builds(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (build_id, tag_id)
);

CREATE INDEX idx_build_tags_build_id ON public.build_tags (build_id);
CREATE INDEX idx_build_tags_tag_id ON public.build_tags (tag_id);

ALTER TABLE public.build_tags ENABLE ROW LEVEL SECURITY;

-- Everyone can read build-tag relationships
CREATE POLICY "Public can read build tags"
ON public.build_tags
FOR SELECT
USING (true);

-- Build owners can manage tags on their own builds
CREATE POLICY "Build owners can insert build tags"
ON public.build_tags
FOR INSERT
WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.builds WHERE builds.id = build_tags.build_id
));

CREATE POLICY "Build owners can delete build tags"
ON public.build_tags
FOR DELETE
USING (auth.uid() IN (
    SELECT user_id FROM public.builds WHERE builds.id = build_tags.build_id
));
