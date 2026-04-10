import { callRPC, convertParams, deleteObject, paginateParams, pinComment, unpinComment } from "./supabaseTemplates";

const searchParams = {
    query: "p_query",
    planIds: "plan_id_filter",
    username: "username_exact_filter",
    userId: "user_id_filter",
    tags: "tag_filter",
    sortBy: "p_sort_by",
    published: "p_published",
    ignoreBlockDiscovery: "p_ignore_block_discovery"
}

const createParams = {
    planId: "p_plan_id",
    title: "p_title",
    body: "p_body",
    recommendationMode: "p_recommendation_mode",
    difficulty: "p_difficulty",
    identityIds: "p_identity_ids",
    egoIds: "p_ego_ids",
    extraOpts: "p_extra_opts",
    graceLevels: "p_grace_levels",
    cost: "p_cost",
    keywordId: "p_keyword_id",
    startGiftIds: "p_start_gift_ids",
    observeGiftIds: "p_observe_gift_ids",
    targetGiftIds: "p_target_gift_ids",
    floors: "p_floors",
    youtubeVideoId: "p_youtube_video_id",
    published: "p_is_published",
    blockDiscovery: "p_block_discovery",
    buildIds: "p_build_ids",
    tags: "p_tags"
}

const DEFAULT_PAGE_SIZE = 20;

export async function searchMdPlans(params, page, pageSize = null) {
    return callRPC("search_md_plans_v2", paginateParams(convertParams(params, searchParams), page, pageSize ?? DEFAULT_PAGE_SIZE));
}

export async function getMdPlan(planId) {
    return callRPC("get_md_plan_v2", { p_plan_id: planId });
}

export async function createMdPlan(params) {
    return callRPC("create_md_plan_v2", convertParams(params, createParams));
}

export async function updateMdPlan(params) {
    await callRPC("update_md_plan_v2", convertParams(params, createParams));
    return params.planId;
}

export async function deleteMdPlan(planId) {
    return deleteObject("md_plans", planId);
}

export async function pinMdPlanComment(planId, commentId) {
    return pinComment("md_plans", planId, commentId);
}

export async function unpinMdPlanComment(planId) {
    return unpinComment("md_plans", planId);
}

export async function getSavedMdPlans(user_id, page = 1, pageSize = null) {
    return callRPC("get_saved_md_plans_v2", paginateParams({ p_user_id: user_id }, page, pageSize ?? DEFAULT_PAGE_SIZE));
}
