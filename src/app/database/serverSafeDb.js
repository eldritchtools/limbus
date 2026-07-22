import { cacheLife, cacheTag } from "next/cache";

import { callRPC, paginateParams } from "./supabaseTemplates";

export async function getHomepagePosts() {
    "use cache";

    cacheLife({ stale: 300 });
    cacheTag("homepage");

    return callRPC("get_homepage_posts_v6", { popular_limit: 5, newest_limit: 5, showcase_limit: 5, mdplans_limit: 5, collections_limit: 0 });
}

export async function getBuild(id) {
    "use cache";

    cacheLife({ stale: 300 });
    cacheTag(`build:${id}`);

    return callRPC("get_build_v7", {p_build_id: id, p_for_edit: false,});
}

export async function getPopularBuilds(page = 1, pageSize = null) {
    "use cache";

    cacheLife({ stale: 300 });
    cacheTag("popular-builds");

    return callRPC("get_popular_builds_v6", paginateParams({}, page, pageSize ?? 24));
}

export async function getMdPlan(id) {
    "use cache";

    cacheLife({ stale: 300 });
    cacheTag(`mdplan:${id}`);

    return callRPC("get_md_plan_v5", {p_plan_id: id,});
}

export async function getPopularMdPlans(page = 1, pageSize = null) {
    "use cache";

    cacheLife({ stale: 300 });
    cacheTag("popular-md-plans");

    return callRPC("search_md_plans_v5", paginateParams({p_published: true, p_sort_by: "popular"}, page, pageSize ?? 30));
}