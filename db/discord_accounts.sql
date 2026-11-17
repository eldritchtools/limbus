CREATE TABLE public.discord_accounts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    discord_id TEXT UNIQUE NOT NULL,
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at timestamptz not null default now()
);

ALTER TABLE public.discord_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own Discord connection"
ON public.discord_accounts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

create or replace function public.link_discord_account(
    p_secret text,
    p_discord_id text,
    p_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
    if p_secret is distinct from (
        select value
        from public.secrets
        where id = 'discord-link-secret'
    ) then
        raise exception 'Unauthorized';
    end if;

    insert into public.discord_accounts (
        user_id,
        discord_id
    )
    values (
        p_user_id,
        p_discord_id
    )
    on conflict (user_id)
    do update set
        discord_id = excluded.discord_id,
        updated_at = now()
    where public.discord_accounts.discord_id = excluded.discord_id
       or not exists (
            select 1
            from public.discord_accounts
            where discord_id = excluded.discord_id
       );

    return found;
end;
$$;

revoke all on function public.link_discord_account(text, text, uuid) from public;
grant execute on function public.link_discord_account(text, text, uuid) to anon, authenticated;

create or replace function public.unlink_discord_account()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    deleted boolean;
begin
    if auth.uid() is null then
        raise exception 'Not authenticated';
    end if;

    delete from public.discord_accounts
    where user_id = auth.uid();

    deleted := found;

    return deleted;
end;
$$;

revoke all on function public.unlink_discord_account() from public;
grant execute on function public.unlink_discord_account() to authenticated;

create or replace function public.set_discord_notifications(
    p_enabled boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if auth.uid() is null then
        raise exception 'Not authenticated';
    end if;

    update public.discord_accounts
    set
        notifications_enabled = p_enabled,
        updated_at = now()
    where user_id = auth.uid();
end;
$$;

revoke all on function public.set_discord_notifications(boolean) from public;
grant execute on function public.set_discord_notifications(boolean) to authenticated;

create or replace function public.notify_discord_on_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    perform net.http_post(
        url := (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'discord_function_url'
        ),
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-webhook-secret', (
                select decrypted_secret
                from vault.decrypted_secrets
                where name = 'discord_webhook_secret'
            )
        ),
        body := jsonb_build_object(
            'type', tg_op,
            'table', tg_table_name,
            'schema', tg_table_schema,
            'record', to_jsonb(new),
            'old_record', null
        )
    );

    return new;
end;
$$;

create trigger discord_notification_webhook
after insert on public.notifications
for each row
execute function public.notify_discord_on_notification();