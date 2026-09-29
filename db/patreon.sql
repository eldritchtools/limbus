create table public.patreon_accounts (
    patreon_user_id text primary key,
    user_id uuid unique references public.users(id) on delete set null,
    patron_status text,
    patreon_name text,
    display_preference text not null default 'patreon'
        check (display_preference in ('patreon', 'username', 'hidden')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.patreon_accounts enable row level security;

create policy "Users can view their own Patreon account"
on public.patreon_accounts
for select
using (auth.uid() = user_id);

create or replace function public.set_patreon_display_preference(
    p_preference text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_preference not in ('patreon', 'username', 'hidden') then
        raise exception 'Invalid display preference';
    end if;

    update public.patreon_accounts
    set
        display_preference = p_preference,
        updated_at = now()
    where user_id = auth.uid();
end;
$$;

create or replace function public.sync_patreon_account(
    p_secret text,
    p_patreon_user_id text,
    p_patreon_name text,
    p_patron_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_secret is distinct from (
        select value
        from public.secrets
        where id = 'patreon-sync-secret'
    ) then
        raise exception 'Unauthorized';
    end if;

    insert into public.patreon_accounts (
        patreon_user_id,
        patreon_name,
        patron_status
    )
    values (
        p_patreon_user_id,
        p_patreon_name,
        p_patron_status
    )
    on conflict (patreon_user_id)
    do update set
        patreon_name = excluded.patreon_name,
        patron_status = excluded.patron_status,
        updated_at = now();
end;
$$;

revoke all on function public.sync_patreon_account(text, text, text, text) from public;
grant execute on function public.sync_patreon_account(text, text, text, text) to anon, authenticated;

create or replace function public.deactivate_patreon_account(
    p_secret text,
    p_patreon_user_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_secret is distinct from (
        select value
        from public.secrets
        where id = 'patreon-sync-secret'
    ) then
        raise exception 'Unauthorized';
    end if;

    update public.patreon_accounts
    set
        patron_status = null,
        updated_at = now()
    where patreon_user_id = p_patreon_user_id;
end;
$$;

revoke all on function public.deactivate_patreon_account(text, text) from public;
grant execute on function public.deactivate_patreon_account(text, text) to anon, authenticated;

create or replace function public.link_patreon_account(
    p_secret text,
    p_patreon_user_id text,
    p_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_secret is distinct from (
        select value
        from public.secrets
        where id = 'patreon-sync-secret'
    ) then
        raise exception 'Unauthorized';
    end if;

    update public.patreon_accounts
    set
        user_id = p_user_id,
        updated_at = now()
    where patreon_user_id = p_patreon_user_id
      and (user_id is null or user_id = p_user_id);

    return found;
end;
$$;

revoke all on function public.link_patreon_account(text, text, uuid) from public;
grant execute on function public.link_patreon_account(text, text, uuid) to authenticated;

create or replace function public.unlink_patreon_account()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    updated boolean;
begin
    if auth.uid() is null then
        raise exception 'Not authenticated';
    end if;

    update public.patreon_accounts
    set
        user_id = null,
        updated_at = now()
    where user_id = auth.uid();

    updated := found;

    return updated;
end;
$$;

revoke all on function public.unlink_patreon_account() from public;
grant execute on function public.unlink_patreon_account() to authenticated;

create or replace function public.get_patreon_supporters()
returns table (
    display_name text
)
language sql
security definer
set search_path = public
as $$
    select
        case
            when pa.display_preference = 'username'
                then u.username
            else pa.patreon_name
        end as display_name
    from public.patreon_accounts pa
    left join public.users u
        on u.id = pa.user_id
    where pa.patron_status is not null
      and pa.display_preference <> 'hidden'
      and (
          pa.display_preference = 'patreon'
          or u.username is not null
      )
    order by pa.created_at;
$$;

revoke all on function public.get_patreon_supporters() from public;
grant execute on function public.get_patreon_supporters() to anon, authenticated;