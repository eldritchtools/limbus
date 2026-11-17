import { getSupabase } from "./connection";
import { callRPC, withRetry } from "./supabaseTemplates"

export async function setDiscordNotificationsEnabled(enabled) {
    return callRPC("set_discord_notifications", {
        p_enabled: enabled
    })
}

export async function unlinkDiscordAccount() {
    return callRPC("unlink_discord_account", {})
}

export async function fetchDiscordAccount(userId) {
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("discord_accounts")
            .select("discord_id, notifications_enabled")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) throw error;
        return data;
    });
}