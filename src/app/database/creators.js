import { getSupabase } from "./connection";
import { callRPC, withRetry } from "./supabaseTemplates";

export async function submitCreatorTagVotes(creatorId, tagIds) {
    return callRPC("submit_creator_tag_votes", {
        p_creator_id: creatorId,
        p_tag_ids: tagIds
    });
};

export async function getCreatorTagVotes(id) {
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("creator_tag_votes")
            .select("tag_ids")
            .eq('creator_id', id)
            .maybeSingle();

        if (error) throw error;
        return data?.tag_ids;
    });
};

export async function searchCreators({ search = null, tagIds = null, isVariety = null, tagThreshold = 0.30, limit = 50 }) {
    return callRPC("search_creators", {
        p_search: search,
        p_tag_ids: tagIds,
        p_is_variety: isVariety,
        p_tag_threshold: tagThreshold,
        p_limit: limit,
    });
};

export async function submitCreatorRequest(requestType, name, links, note) {
    return callRPC("submit_creator_request", {
        p_request_type: requestType,
        p_name: name,
        p_links: links,
        p_note: note
    });
};

export async function createCreator({ name, avatarId, platforms, isVariety }) {
    return callRPC("create_creator", {
        p_name: name,
        p_avatar_id: avatarId,
        p_platforms: platforms,
        p_is_variety: isVariety
    });
};

export async function updateCreator({ id, name, avatarId, platforms, isVariety }) {
    return callRPC("update_creator", {
        p_creator_id: id,
        p_name: name,
        p_avatar_id: avatarId,
        p_platforms: platforms,
        p_is_variety: isVariety
    });
};

export async function deleteCreator(creatorId) {
    return callRPC("delete_creator", { p_creator_id: creatorId });
};
