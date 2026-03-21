import { getSupabase } from "./connection";

export async function fetchTags(prefix) {
    if (!prefix) return [];
    const { data, error } = await getSupabase()
        .from("tags")
        .select("name")
        .ilike("name", `%${prefix}%`)
        .order("name")
        .limit(10);

    if (error) {
        console.error("Error fetching tags:", error);
        return [];
    }

    return data.map(t => t.name);
}

export async function handleCreateTag(name) {
    const { data, error } = await getSupabase()
        .from("tags")
        .insert({ name: name })
        .select("name")
        .single();

    if (error) {
        console.error("Error creating tag:", error);
        return null;
    }
    return data.name;
}
