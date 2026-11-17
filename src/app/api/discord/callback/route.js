import crypto from "crypto";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
    const cookieStore = await cookies();

    const stateCookie = cookieStore.get("discord_oauth_state")?.value;
    const userId = cookieStore.get("discord_oauth_user_id")?.value;

    const params = new URL(request.url).searchParams;
    const code = params.get("code");
    const state = params.get("state");
    const oauthError = params.get("error");

    const redirect = (status) => {
        const response = NextResponse.redirect(new URL(`/edit-profile?discord=${status}`, request.url));
        response.cookies.set("discord_oauth_state", "", { path: "/", maxAge: 0 });
        response.cookies.set("discord_oauth_user_id", "", { path: "/", maxAge: 0 });

        return response;
    };

    if (oauthError || !code || !state || !stateCookie || !userId)
        return redirect("error");

    const receivedState = Buffer.from(state);
    const storedState = Buffer.from(stateCookie);

    if (receivedState.length !== storedState.length || !crypto.timingSafeEqual(receivedState, storedState))
        return redirect("error");

    try {
        const tokenResponse = await fetch(
            "https://discord.com/api/v10/oauth2/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    client_id: process.env.DISCORD_CLIENT_ID,
                    client_secret: process.env.DISCORD_CLIENT_SECRET,
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: process.env.DISCORD_REDIRECT_URI
                })
            }
        );

        if (!tokenResponse.ok) return redirect("error");

        const tokenData = await tokenResponse.json();

        const userResponse = await fetch(
            "https://discord.com/api/v10/users/@me",
            { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
        );

        if (!userResponse.ok) return redirect("error");

        const discordUser = await userResponse.json();

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        );

        const { data, error } = await supabase.rpc(
            "link_discord_account",
            {
                p_secret: process.env.DISCORD_LINK_SECRET,
                p_discord_id: discordUser.id,
                p_user_id: userId
            }
        );

        if (error || !data) {
            console.error("Discord account linking failed:", error);
            return redirect("link-failed");
        }

        return redirect("connected");
    } catch (error) {
        console.error("Discord OAuth callback failed:", error);
        return redirect("error");
    }
}