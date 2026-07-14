import { LRUCache } from "lru-cache";

import { callRPC } from "./supabaseTemplates";
const cache = new LRUCache({ max: 500, ttl: 1000 * 60 * 60 });

const key = "homepage";

export async function getHomepagePosts() {
    const cached = cache.get(key);
    if (cached) return cached;

    const data = callRPC("get_homepage_posts_v6", { popular_limit: 5, newest_limit: 5, showcase_limit: 5, mdplans_limit: 5, collections_limit: 0 });
    cache.set(key, data);
    return data;
}
