create table follows (
  follower_user_id uuid not null references public.users(id) on delete cascade,
  followed_user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),

  primary key (follower_user_id, followed_user_id),

  check (follower_user_id <> followed_user_id)
);

alter table follows
alter column follower_user_id set default auth.uid();

create index follows_followed_idx on follows (followed_user_id);
create index follows_follower_idx on follows (follower_user_id);

alter table follows enable row level security;

create policy "Anyone can view follows"
on follows
for select
to authenticated
using (true);

create policy "Users can follow people"
on follows
for insert
to authenticated
with check (
  follower_user_id = auth.uid()
);

create policy "Users can unfollow people"
on follows
for delete
to authenticated
using (
  follower_user_id = auth.uid()
);

revoke update on follows from authenticated;
grant select, insert, delete on follows to authenticated;

create or replace function notify_followers_on_publish()
returns trigger
language plpgsql
security definer
as $$
declare
  v_target_type target_type_enum;
begin
  v_target_type := TG_ARGV[0]::target_type_enum;

  if NEW.is_published = true
     and (
       TG_OP = 'INSERT'
       or OLD.is_published = false
     )
  then

    insert into public.notifications (
      user_id,
      actor_ids,
      target_type,
      target_id,
      type
    )
    select
      f.follower_user_id,
      array[NEW.user_id],
      v_target_type,
      NEW.id,
      'new_post'::notification_type_enum
    from follows f
    where f.followed_user_id = NEW.user_id;

  end if;

  return NEW;
end;
$$;

create trigger builds_notify_followers
after insert or update of is_published on builds
for each row
execute function notify_followers_on_publish('build');

create trigger md_plans_notify_followers
after insert or update of is_published on md_plans
for each row
execute function notify_followers_on_publish('md_plan');

create trigger collections_notify_followers
after insert or update of is_published on collections
for each row
execute function notify_followers_on_publish('collection');