import { getSupabase } from "./connection";

export async function sendFeedback(type, message) {
    const feedback = {type, message};

    const { data, error } = await getSupabase().from("feedback").insert(feedback);

    if (error) throw error;
    return data;
}
