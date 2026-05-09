import { getSupabase } from "./connection";
import { withRetry } from "./supabaseTemplates";

export async function fetchTags(prefix) {
    if (!prefix) return [];
    try {
        return await withRetry(async () => {
            const { data, error } = await getSupabase()
                .from("tags")
                .select("name")
                .ilike("name", `%${prefix}%`)
                .order("name")
                .limit(10);

            if (error) throw error;

            return data.map(t => t.name);
        });
    } catch (err) {
        console.error("Error fetching tags:", err);
        return [];
    }
}

export async function handleCreateTag(name) {
    try {
        return await withRetry(async () => {
            const { data, error } = await getSupabase()
                .from("tags")
                .insert({ name: name })
                .select("name")
                .single();

            if (error) throw error
            return data.name;
        });
    } catch (err) {
        console.error("Error creating tag:", err);
        return null;

    }
}
