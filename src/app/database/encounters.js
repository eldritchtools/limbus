import { getSupabase } from "./connection";
import { withRetry } from "./supabaseTemplates";

const cache = {};

export async function fetchEncounter(id) {
    if (id in cache) return cache[id];

    const result = await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("encounters")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) throw error;
        return data;
    });

    cache[id] = result;
    return result;
}
