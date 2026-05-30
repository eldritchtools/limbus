import { getSupabase } from "./connection";
import { callRPC, withRetry } from "./supabaseTemplates";

let userAssetCache = {};

export async function createCommunityAsset(id, type, prefix, keywords) {
    const result = callRPC("create_community_asset", { p_id: id, p_type: type, p_prefix: prefix, p_keywords: keywords });
    userAssetCache = {};
    return result;
}

export async function updateCommunityAsset(id, prefix, keywords) {
    const result = callRPC("update_community_asset", { p_id: id, p_prefix: prefix, p_keywords: keywords });
    userAssetCache = {};
    return result;
}

export async function searchCommunityAssets(query, type, limit = 50) {
    return callRPC("search_community_assets", { p_query: query, p_type: type, p_limit: limit });
}

export async function getCommunityAsset(id) {
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("community_assets")
            .select("id, type, prefix, keywords, created_at")
            .eq("id", id)
            .eq("is_deleted", false)
            .single();

        if (error) throw error;
        return data;
    });
}

export async function deleteCommunityAsset(id) {
    const result = await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("community_assets")
            .update({ is_deleted: true })
            .eq("id", id);

        if (error) throw error;
        return { success: true };
    });
    userAssetCache = {};
    return result;
}

export async function getUserCommunityAssets(userId, type, full = false) {
    const key = `${userId}|${type}|${full}`;
    const cached = userAssetCache[key];
    if(cached) return cached;
    
    const result = await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("community_assets")
            .select(full ? "*" : "id, prefix, created_at")
            .eq("user_id", userId)
            .eq("type", type)
            .eq("is_deleted", false)
            .order("created_at", { ascending: false })

        if (error) throw error;
        return data;
    });
    
    userAssetCache[key] = result;
    return result;
}

export async function getRecentCommunityAssets(type, limit = 50) {
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("community_assets")
            .select("id, prefix, created_at")
            .eq("type", type)
            .eq("is_deleted", false)
            .order("created_at", { ascending: false })
            .limit(limit)

        if (error) throw error;
        return data;
    });
}