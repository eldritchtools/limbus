import { createClient } from "npm:@supabase/supabase-js@2";

const SITE_URL = Deno.env.get("SITE_URL")!;

async function getNotificationTarget(targetType: string | null, targetId: string | null) {
    if (!targetType || !targetId) return null;

    let title: string | null = null;
    let url: string | null = null;

    switch (targetType) {
        case "build": {
            const { data } = await supabase.from("builds").select("title").eq("id", targetId).maybeSingle();

            if (data) {
                title = data.title;
                url = `/builds/${targetId}`;
            }
            break;
        }

        case "md_plan": {
            const { data } = await supabase.from("md_plans").select("title").eq("id", targetId).maybeSingle();

            if (data) {
                title = data.title;
                url = `/md-plans/${targetId}`;
            }
            break;
        }

        case "collection": {
            const { data } = await supabase.from("collections").select("title").eq("id", targetId).maybeSingle();

            if (data) {
                title = data.title;
                url = `/collections/${targetId}`;
            }
            break;
        }

        case "fixed": {
            const { data } = await supabase.from("fixed_pages").select("title, slug").eq("id", targetId).maybeSingle();

            if (data) {
                title = data.title;
                url = `/${data.slug}`;
            }
            break;
        }

        case "encounter": {
            const { data } = await supabase.from("encounters").select("category, slug").eq("id", targetId).maybeSingle();

            if (data) {
                title = null;
                url = `/encounters?${new URLSearchParams({ category: data.category, encounter: data.slug }).toString()}`;
            }
            break;
        }

        default:
            return null;
    }

    if (!url) return null;

    return { title, url: new URL(url, SITE_URL).toString() };
}

const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN")!;
const WEBHOOK_SECRET = Deno.env.get("DISCORD_WEBHOOK_SECRET")!;

function getMessage(
    type: string,
    actors: string[],
    target: { title: string | null; url: string } | null
) {
    const names = actors.length ? actors.length === 1 ? actors[0] : `${actors.slice(0, -1).join(", ")} and ${actors.at(-1)}` : "Someone";

    let message: string;

    switch (type) {
        case "comment":
            message = `${names} commented on your post`;
            break;

        case "reply":
            message = `${names} replied to your comment`;
            break;

        case "collection_submission":
            message = `${names} submitted something to your collection`;
            break;

        case "collection_submission_approved":
            message = "Your collection submission was approved";
            break;

        case "collection_submission_rejected":
            message = "Your collection submission was rejected";
            break;

        case "new_post":
            message = `${names} published a new post`;
            break;

        default:
            return null;
    }

    if (target) {
        const label = target.title || "View encounter";
        message += `: [${label}](${target.url})`;
    }

    return message + ".";
}

async function sendDiscordDM(discordId: string, message: string) {
    const channelResponse = await fetch(
        "https://discord.com/api/v10/users/@me/channels",
        {
            method: "POST",
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                recipient_id: discordId
            })
        }
    );

    if (!channelResponse.ok) {
        throw new Error(`Discord channel creation failed: ${await channelResponse.text()}`);
    }

    const channel = await channelResponse.json();

    const messageResponse = await fetch(
        `https://discord.com/api/v10/channels/${channel.id}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: message,
                allowed_mentions: {
                    parse: []
                }
            })
        }
    );

    if (!messageResponse.ok) {
        throw new Error(`Discord message failed: ${await messageResponse.text()}`);
    }
}

Deno.serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    if (req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const payload = await req.json();
        const notification = payload.record;

        if (!notification?.user_id || !notification?.type) {
            return Response.json({ error: "Invalid notification payload" }, { status: 400 });
        }

        const { data: connection, error: connectionError } = await supabase
            .from("discord_accounts")
            .select("discord_id, notifications_enabled")
            .eq("user_id", notification.user_id)
            .maybeSingle();

        if (connectionError) throw connectionError;

        if (!connection || !connection.notifications_enabled) {
            return Response.json({ skipped: true });
        }

        const actorIds = [...new Set(notification.actor_ids ?? [])];
        let actors: string[] = [];

        if (actorIds.length) {
            const { data, error } = await supabase
                .from("users")
                .select("id, username")
                .in("id", actorIds);

            if (error) throw error;

            actors = (data ?? []).map(user => user.username);
        }

        const target = await getNotificationTarget(
            notification.target_type,
            notification.target_id
        );

        const message = getMessage(notification.type, actors, target);

        if (!message) {
            return Response.json({ skipped: true, reason: "Unsupported notification type" });
        }

        await sendDiscordDM(connection.discord_id, message);

        return Response.json({ success: true });
    } catch (error) {
        console.error("Discord notification error:", error);

        return Response.json(
            {
                error: String(error),
                details: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
});