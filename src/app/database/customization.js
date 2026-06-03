import { getSupabase } from "./connection";
import { withRetry } from "./supabaseTemplates";

export async function saveCustomization(userId, customization) {
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("user_customizations")
            .upsert({
                user_id: userId,
                settings: customization,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    });
}

export async function loadCustomization() {
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("user_customizations")
            .select("settings, updated_at")
            .maybeSingle();

        if (error) throw error;
        return data;
    });
}

export async function deleteCustomization(userId) {
    return await withRetry(async () => {
        const { error } = await getSupabase()
            .from("user_customizations")
            .delete()
            .eq("user_id", userId)

        if (error) throw error;
    });
}
