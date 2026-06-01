import { LRUCache } from "lru-cache";

import { getSupabase } from "../database/connection";
import { DATA_ROOT } from "../paths";

import metadataIndexFallback from "@/data/metadata_index.json";

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 * 60 });

async function getFromDatabase(table, id) {
    const key = `${table}:${id}`;
    const cached = cache.get(key);
    if (cached) return { status: "ok", data: cached };

    const { data, error } = await getSupabase()
        .from(table)
        .select("id, title, body, created_at, updated_at, published_at, user:users ( username )")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        return { status: "error", data: null };
    }

    if (!data) {
        return { status: "not_found", data: null };
    }

    const result = {
        ...data,
        username: data?.user?.username ?? null,
    };

    cache.set(key, result);
    return { status: "ok", data: result };
}

export const getBuildForMetadata = async id => getFromDatabase("builds", id);
export const getCollectionForMetadata = async id => getFromDatabase("collections", id);
export const getMdPlanForMetadata = async id => getFromDatabase("md_plans", id);

const getMetadataIndex = async () => {
    const res = await fetch(`${DATA_ROOT}/metadata_index.json`, { next: { revalidate: 3600 } });

    if (!res.ok) {
        return metadataIndexFallback;
    }

    const text = await res.text();

    try {
        const json = JSON.parse(text);
        return json;
    } catch {
        return metadataIndexFallback;
    }
}

const getMetadataIndexData = async (type) => {
    return (await getMetadataIndex())?.[type] ?? {};
}

const backupCache = new LRUCache({ max: 100, ttl: 1000 * 60 * 5 });

async function getMetadataFromDatabase(key) {
    const cached = backupCache.get(key);
    if (cached !== undefined) return cached;

    const { data, error } = await getSupabase()
        .from("page_metadata")
        .select("title")
        .eq("slug", key)
        .maybeSingle()

    if (error) return null;

    if (!data) {
        backupCache.set(key, null);
        return null;
    }

    backupCache.set(key, data.title);
    return data.title;
}

export const getIdentityMetadata = async (id) => {
    const metadataIndex = await getMetadataIndexData("identities");
    if (String(id) in metadataIndex) return metadataIndex[String(id)];
    return getMetadataFromDatabase(`identities/${id}`);
}

export const getEgoMetadata = async (id) => {
    const metadataIndex = await getMetadataIndexData("egos");
    if (String(id) in metadataIndex) return metadataIndex[String(id)];
    return getMetadataFromDatabase(`egos/${id}`);
}

export const getEncounterMetadata = async (category, encounter) => {
    const metadataIndex = await getMetadataIndexData("encounters");
    if (category in metadataIndex && encounter in metadataIndex[category]) return metadataIndex[category][encounter];
    return getMetadataFromDatabase(`encounters/${category}/${encounter}`);
}

export function cleanMetadataDescription(text = "") {
    if (!text) return "";

    return text
        .replace(/\{.*?\}/g, "")
        .replace(/[#_*`>]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);
}