import { getSupabase } from "./connection";
import { withRetry } from "./supabaseTemplates";

export async function getUserDataFromUsername(username, field = "*") {
    return await withRetry(async () => {
        const { data: user } = await getSupabase()
            .from("users")
            .select(field)
            .eq("username", username)
            .maybeSingle();

        if (user) return user;
        else return null;
    });
}

export async function updateUser(userId, flair, description, socials) {
    const update = {
        flair: flair.trim(),
        description: description.trim(),
        socials: socials
    };

    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("users")
            .update(update)
            .eq("id", userId)

        if (error) throw error;
        return data;
    });
}

export async function updateUserAvatar(userId, avatarId) {
    const update = { avatar_id: avatarId };

    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("users")
            .update(update)
            .eq("id", userId)

        if (error) throw error;
        return data;
    });
}