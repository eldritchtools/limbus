import crypto from "crypto";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request) {
    const url = new URL(request.url);

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const cookieStore = await cookies();

    const savedState = cookieStore.get("patreon_oauth_state")?.value;
    const userId = cookieStore.get("patreon_oauth_user_id")?.value;
    const returnTo = cookieStore.get("patreon_oauth_return_to")?.value || "/edit-profile";

    const clearCookies = () => {
        cookieStore.delete("patreon_oauth_state");
        cookieStore.delete("patreon_oauth_user_id");
        cookieStore.delete("patreon_oauth_return_to");
    };

    if (!code || !state || !savedState || !userId) {
        console.log("Patreon callback: missing OAuth data", {
            hasCode: !!code,
            hasState: !!state,
            hasSavedState: !!savedState,
            hasUserId: !!userId
        });

        clearCookies();
        redirect("/edit-profile?patreon=error");
    }

    if (state.length !== savedState.length || !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(savedState))) {
        console.log("Patreon callback: invalid state");

        clearCookies();
        redirect("/edit-profile?patreon=error");
    }

    // Exchange Patreon authorization code for an access token.
    const tokenResponse = await fetch(
        "https://www.patreon.com/api/oauth2/token",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                grant_type: "authorization_code",
                client_id: process.env.PATREON_CLIENT_ID,
                client_secret: process.env.PATREON_CLIENT_SECRET,
                redirect_uri: process.env.PATREON_REDIRECT_URI
            })
        }
    );

    if (!tokenResponse.ok) {
        console.error("Patreon token exchange failed:", await tokenResponse.text());

        clearCookies();
        redirect("/edit-profile?patreon=error");
    }

    const token = await tokenResponse.json();

    const identityResponse = await fetch(
        "https://www.patreon.com/api/oauth2/v2/identity",
        {
            headers: { Authorization: `Bearer ${token.access_token}` }
        }
    );

    if (!identityResponse.ok) {
        console.error("Patreon identity request failed:", await identityResponse.text());

        clearCookies();
        redirect("/edit-profile?patreon=error");
    }

    const identity = await identityResponse.json();
    const patreonUserId = identity.data?.id;

    console.log(patreonUserId);

    if (!patreonUserId) {
        console.log("Patreon callback: no Patreon user ID");

        clearCookies();
        redirect("/edit-profile?patreon=error");
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    const { data: linked, error } = await supabase.rpc(
        "link_patreon_account",
        {
            p_secret: process.env.PATREON_SYNC_SECRET,
            p_patreon_user_id: patreonUserId,
            p_user_id: userId
        }
    );

    if (error || !linked) {
        console.error("Patreon linking failed:", error);
        clearCookies();
        redirect("/edit-profile?patreon=error");
    }

    clearCookies();

    redirect(returnTo);
}