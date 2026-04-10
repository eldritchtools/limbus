import { callRPC } from "./supabaseTemplates";

export async function getHomepagePosts() {
    return callRPC("get_homepage_posts_v2", { popular_limit: 5, newest_limit: 5, showcase_limit: 5, mdplans_limit: 5, collections_limit: 1 });
}