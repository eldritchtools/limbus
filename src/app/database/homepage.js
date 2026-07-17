import { getCached } from "./dbCache";
import { callRPC } from "./supabaseTemplates";

export async function getHomepagePosts() {
    const loader = () => 
        callRPC("get_homepage_posts_v6", { popular_limit: 5, newest_limit: 5, showcase_limit: 5, mdplans_limit: 5, collections_limit: 0 });

    return getCached("homepage", loader);
}
