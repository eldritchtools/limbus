import { getSupabase } from "./connection";
import { withRetry } from "./supabaseTemplates";

export async function sendFeedback(type, message) {
    return await withRetry(async () => {
        const feedback = { type, message };

        const { data, error } = await getSupabase().from("feedback").insert(feedback);

        if (error) throw error;
        return data;
    });
}
