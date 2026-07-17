import { LRUCache } from "lru-cache";

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 * 5 });

export async function getCached(key, loader) {
    const cached = cache.get(key);
    if (cached !== undefined) return cached;

    const value = await loader();
    cache.set(key, value);
    return value;
}

export async function deleteCached(key) {
    cache.delete(key);
}