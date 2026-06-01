CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  flair TEXT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  socials JSONB DEFAULT '[]',
  avatar_id TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users
ADD CONSTRAINT flair_length CHECK (char_length(flair) <= 32);

CREATE UNIQUE INDEX idx_users_username ON public.users(username);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Only allow a user to view or update their own profile
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Optionally, allow everyone to view usernames (for display purposes)
CREATE POLICY "Public can view usernames"
ON public.users
FOR SELECT
USING (true);


-- This runs whenever a new user is created in auth.users
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username)
  values (new.id, null)  -- you can fill username later
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

CREATE TABLE public.user_moderation (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,

  asset_upload_disabled_until TIMESTAMPTZ DEFAULT NULL,
  moderator_note TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_moderation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can view own moderation status"
ON public.user_moderation
FOR SELECT
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION block_user_asset_uploads(
  p_user_id UUID,
  p_days INT DEFAULT 7,
  p_note TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_moderation (
    user_id,
    asset_upload_disabled_until,
    moderator_note,
    updated_at
  )
  VALUES (
    p_user_id,
    NOW() + (p_days || ' days')::INTERVAL,
    p_note,
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    asset_upload_disabled_until = NOW() + (p_days || ' days')::INTERVAL,
    moderator_note = COALESCE(p_note, user_moderation.moderator_note),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;