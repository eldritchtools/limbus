import { getCached } from "./dbCache";
import { callRPC, paginateParams } from "./supabaseTemplates";

export async function getBuild(id) {
    const loader = () => callRPC("get_build_v7", { p_build_id: id, p_for_edit: false })
    return getCached(`build:${id}`, loader);
}

export async function getPopularBuilds(page = 1, pageSize = null) {
    const loader = () => callRPC("get_popular_builds_v6", paginateParams({}, page, pageSize ?? 24));
    return getCached("popular-builds", loader);
}

export async function getMdPlan(id) {
    const loader = () => callRPC("get_md_plan_v5", { p_plan_id: id })
    return getCached(`mdplan:${id}`, loader);
}

export async function getPopularMdPlans(page = 1, pageSize = null) {
    const loader = () => callRPC("search_md_plans_v5", { p_published: true, p_sort_by: "popular" }, page, pageSize ?? 30);
    return getCached("popular-md-plans", loader);
}
