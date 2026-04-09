import { getSupabase } from "./connection";
import { callRPC, convertParams, deleteObject, paginateParams, pinComment, unpinComment } from "./supabaseTemplates";

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
    published: "p_published"
};

const DEFAULT_PAGE_SIZE = 24;

export async function getPopularBuilds(page = 1, pageSize = null) {
    return callRPC("get_popular_builds_v5", paginateParams({}, page, pageSize ?? DEFAULT_PAGE_SIZE));
}

export async function searchBuilds(params, page = 1, pageSize = null) {
    return callRPC("search_builds_v9", paginateParams(convertParams(params, searchParams), page, pageSize ?? DEFAULT_PAGE_SIZE));
}

export async function getBuild(id, forEdit = false) {
    return callRPC("get_build_v4", { p_build_id: id, p_for_edit: forEdit });
}

export async function insertBuild(params) {
    return callRPC("create_build_v4", convertParams(params, createParams));
}

export async function updateBuild(params) {
    await callRPC("update_build_v4", convertParams(params, createParams));
    return params.buildId;
}

export async function deleteBuild(build_id) {
    return deleteObject("builds", build_id);
}

export async function pinBuildComment(buildId, commentId) {
    return pinComment("builds", buildId, commentId);
}

export async function unpinBuildComment(buildId) {
    return unpinComment("builds", buildId);
}

export async function getSavedBuilds(user_id, page = 1, pageSize = null) {
    return callRPC("get_saved_builds_v4", paginateParams({p_user_id: user_id}, page, pageSize ?? DEFAULT_PAGE_SIZE))
}

export async function getBuildsForSitemap(page, count) {
    const offset = (page - 1) * count;
    const { data, error } = await getSupabase()
        .from('builds')
        .select('id, created_at, updated_at')
        .eq('is_published', true)
        .order('created_at', { ascending: true })
        .range(offset, offset + count - 1);

    if (error) throw (error);
    return data;
}

export async function getBuildsCountForSitemap() {
    const { count, error } = await getSupabase()
        .from('builds')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

    if (error) throw (error);
    return count;
}
