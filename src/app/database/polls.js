import { getSupabase } from "./connection";
import { callRPC, withRetry } from "./supabaseTemplates";

export async function getCurrentPoll() {
    return callRPC("get_current_poll", {});
}

export async function submitPollVote(userId, pollId, answerMask) {
    return callRPC("submit_vote", { p_user_id: userId, p_poll_id: pollId, p_new_mask: answerMask });
}

export async function getPolls(page = 1, pageSize = 50) {
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("polls")
            .select("*")
            .order("created_at", { ascending: false })
            .offset((page - 1) * pageSize)
            .limit(pageSize)

        if (error) throw error;
        return data;
    });
}
