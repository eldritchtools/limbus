import { callRPC, convertParams, deleteObject, paginateParams, pinComment, unpinComment } from "./supabaseTemplates";
import { contentConfig } from "../lib/contentConfig";

const searchParams = {
    query: "p_query",
    buildIds: "build_id_filter",
    userId: "user_id_filter",
    username: "username_exact_filter",
    tags: "tag_filter",
    identities: "identity_filter",
    identitiesExclude: "identity_exclude",
    egos: "ego_filter",
    egosExclude: "ego_exclude",
    keywords: "keyword_filter",
    keywordsExclude: "keyword_exclude",
    ignoreBlockDiscovery: "p_ignore_block_discovery",
    includeEgos: "p_include_egos",
    published: "p_published",
    sortBy: "p_sort_by",
    strictFiltering: "p_strict_filter"
};

const createParams = {
    buildId: "p_build_id",
    userId: "p_user_id",
    title: "p_title",
    body: "p_body",
    identityIds: "p_identity_ids",
    egoIds: "p_ego_ids",
    keywordIds: "p_keyword_ids",
    deploymentOrder: "p_deployment_order",
    activeSinners: "p_active_sinners",
    teamCode: "p_team_code",
    youtubeVideoId: "p_youtube_video_id",
    tags: "p_tags",
    extraOpts: "p_extra_opts",
    blockDiscovery: "p_block_discovery",
    published: "p_published",
    imageIds: "p_image_ids"
};

export async function getPopularBuilds(page = 1, pageSize = null) {
    return callRPC("get_popular_builds_v6", paginateParams({}, page, pageSize ?? contentConfig.builds.defaultPageSize));
}

export async function searchBuilds(params, page = 1, pageSize = null) {
    return callRPC("search_builds_v11", paginateParams(convertParams(params, searchParams), page, pageSize ?? contentConfig.builds.defaultPageSize));
}

export async function getBuild(id, forEdit = false) {
    return callRPC("get_build_v7", { p_build_id: id, p_for_edit: forEdit });
}

export async function insertBuild(params) {
    return callRPC("create_build_v6", convertParams(params, createParams));
}

export async function updateBuild(params) {
    await callRPC("update_build_v6", convertParams(params, createParams));
    return params.buildId;
}

export async function deleteBuild(build_id) {
    await callRPC("delete_build", { p_build_id: build_id });
    return { deleted: true };
}

export async function pinBuildComment(buildId, commentId) {
    return pinComment("builds", buildId, commentId);
}

export async function unpinBuildComment(buildId) {
    return unpinComment("builds", buildId);
}

export async function getSavedBuilds(user_id, page = 1, pageSize = null) {
    return callRPC("get_saved_builds_v5", paginateParams({ p_user_id: user_id }, page, pageSize ?? contentConfig.builds.defaultPageSize))
}
