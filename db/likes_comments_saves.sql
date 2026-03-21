CREATE TABLE public.likes (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  target_type target_type_enum,
  target_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, target_id)
);

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  target_id UUID REFERENCES public.builds(id) ON DELETE CASCADE,
  target_type target_type_enum,
  body TEXT NOT NULL,
  deleted BOOLEAN DEFAULT FALSE,
  edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  parent_id UUID REFERENCES public.comments(id) ON DELETE SET NULL
);

CREATE TABLE public.saves (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  target_type target_type_enum,
  target_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, target_id)
);

CREATE INDEX idx_likes_target ON public.likes (target_type, target_id);
CREATE INDEX idx_comments_target_created_at ON public.comments (target_type, target_id, created_at) WHERE deleted = false;
CREATE INDEX idx_saves_user_id ON public.saves(user_id);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS trigger AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_user_id_trigger_likes ON public.likes;
CREATE TRIGGER set_user_id_trigger_likes
BEFORE INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_trigger_saves ON public.saves;
CREATE TRIGGER set_user_id_trigger_saves
BEFORE INSERT ON public.saves
FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_trigger_comments ON public.comments;
CREATE TRIGGER set_user_id_trigger_comments
BEFORE INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE POLICY "users can insert their own likes"
ON public.likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete their own likes"
ON public.likes
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "users can view their own likes"
ON public.likes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own saves"
ON public.saves
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete their own saves"
ON public.saves
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "users can view their own saves"
ON public.saves
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own comments"
ON public.comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete their own comments"
ON public.comments
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "comments are viewable by everyone"
ON public.comments
FOR SELECT
USING (true);

CREATE POLICY "Comment owners can update their comments"
ON public.comments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


CREATE OR REPLACE FUNCTION public.cleanup_target_rows()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_type target_type_enum := TG_ARGV[0]::target_type_enum;
BEGIN

  DELETE FROM public.likes l
  USING (SELECT OLD.id AS id) t
  WHERE l.target_id = t.id
    AND l.target_type = v_type;

  DELETE FROM public.saves s
  USING (SELECT OLD.id AS id) t
  WHERE s.target_id = t.id
    AND s.target_type = v_type;

  DELETE FROM public.comments c
  USING (SELECT OLD.id AS id) t
  WHERE c.target_id = t.id
    AND c.target_type = v_type;

  DELETE FROM public.notifications n
  USING (SELECT OLD.id AS id) t
  WHERE n.target_id = t.id
    AND n.target_type = v_type;

  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_cleanup_build
AFTER DELETE ON public.builds
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_target_rows('build');

CREATE TRIGGER trg_cleanup_collection
AFTER DELETE ON public.collections
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_target_rows('collection');

CREATE TRIGGER trg_cleanup_md_plan
AFTER DELETE ON public.md_plans
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_target_rows('md_plan');

CREATE OR REPLACE FUNCTION public.get_target_comments_v1(
  p_target_id UUID,
  p_target_type target_type_enum,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  username TEXT,
  user_flair TEXT,
  body TEXT,
  created_at TIMESTAMPTZ,
  edited BOOLEAN,
  parent_body TEXT,
  parent_author TEXT,
  parent_flair TEXT,
  parent_deleted BOOLEAN
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT
    c.id,
    c.user_id,
    u.username,
    u.flair,
    c.body,
    c.created_at,
    c.edited,
    p.body AS parent_body,
    pu.username AS parent_author,
    pu.flair AS parent_flair,
    p.deleted AS parent_deleted
  FROM public.comments AS c
  JOIN public.users AS u ON c.user_id = u.id
  LEFT JOIN public.comments AS p ON p.id = c.parent_id
  LEFT JOIN public.users AS pu ON pu.id = p.user_id
  WHERE c.target_id = p_target_id AND c.target_type = p_target_type
    AND NOT c.deleted
  ORDER BY c.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;
