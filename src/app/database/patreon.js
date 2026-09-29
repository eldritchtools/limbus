import { getSupabase } from "./connection";
import { callRPC, withRetry } from "./supabaseTemplates";

export async function syncPatreonAccount(id, name, status) {
    return callRPC("sync_patreon_account", {
        p_secret: process.env.PATREON_SYNC_SECRET,
        p_patreon_user_id: id,
        p_patreon_name: name,
        p_patron_status: status
    })
}

export async function deactivatePatreonAccount(id) {
    return callRPC("deactivate_patreon_account", {
        p_secret: process.env.PATREON_SYNC_SECRET,
        p_patreon_user_id: id
    })
}

export async function setPatreonDisplayPreference(preference) {
    return callRPC("set_patreon_display_preference", {
        p_preference: preference
    })
}

// called by callback api route
// export async function linkPatreonAccount(id) {
//     return callRPC("link_patreon_account", {
//         p_patreon_user_id: id
//     })
// }

export async function unlinkPatreonAccount() {
    return callRPC("unlink_patreon_account", {})
}

export async function getPatreonSupporters() {
    return callRPC("get_patreon_supporters", {})
}

export async function fetchPatreonAccount(userId) {
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("patreon_accounts")
            .select("patreon_user_id, patreon_name, display_preference")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) throw error;
        return data;
    });
}

export async function fetchPatrons() {
    return await withRetry(async () => {
        const { data: patrons, error } = await supabase
            .from("patreon_accounts")
            .select(`
                patreon_name,
                patron_status,
                display_preference,
                users (
                    username
                )
            `)
            .not("patron_status", "is", null);

        if (error) throw error;
        return patrons;
    })
}