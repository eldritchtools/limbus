import { getSupabase } from "./connection";
import { callRPC, withRetry } from "./supabaseTemplates";

export async function followThread(targetType, targetId) {
    return callRPC("follow_thread", {p_target_type: targetType, p_target_id: targetId});
}

export async function unfollowThread(targetType, targetId) {
    return callRPC("unfollow_thread", {p_target_type: targetType, p_target_id: targetId});
}

export async function markThreadRead(targetType, targetId) {
    return callRPC("mark_thread_read", {p_target_type: targetType, p_target_id: targetId});
}

export async function getUserFollowedThreads(userId, limit = null) {
    let options = { p_user_id: userId };
    if (limit) options.p_limit = limit;
    return callRPC("get_user_followed_threads", options);
}

export async function checkFollowThread(userId, targetType, targetId) {
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("thread_subscriptions")
            .select("*")
            .eq("user_id", userId)
            .eq("target_type", targetType)
            .eq("target_id", targetId)
            .maybeSingle();

        if (error) throw error;
        return data;
    });
}