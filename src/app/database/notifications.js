import { getSupabase } from "./connection";
import { callRPC } from "./supabaseTemplates";

export async function getNotifications(userId, limit = null) {
    let options = { p_user_id: userId };
    if (limit) options.p_limit = limit;
    return callRPC("get_user_notifications_v3", options);
}

export async function setNotificationRead(id) {
    const { data, error } = await getSupabase()
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

    if (error) throw error;
    return data;
}

export async function getUnreadNotificationsCount(userId) {
    const { count, error } = await getSupabase()
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) throw error;
    return count ?? 0;
}
