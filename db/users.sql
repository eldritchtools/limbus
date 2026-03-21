CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  flair TEXT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  socials JSONB DEFAULT '[]',
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
