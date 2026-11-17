import crypto from "crypto";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(request) {
    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!accessToken) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const state = crypto.randomBytes(32).toString("hex");
    const cookieStore = await cookies();

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 600
    };

    cookieStore.set("discord_oauth_state", state, cookieOptions);
    cookieStore.set("discord_oauth_user_id", user.id, cookieOptions);

    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
        response_type: "code",
        scope: "identify",
        state
    });

    return Response.json({
        url: `https://discord.com/oauth2/authorize?${params.toString()}`
    });
}