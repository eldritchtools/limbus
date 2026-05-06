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

export const getIdentitiesForMetadata = async () => await getMetadataIndexData("identities");
export const getEgosForMetadata = async () => await getMetadataIndexData("egos");
export const getEncountersForMetadata = async () => await getMetadataIndexData("encounters");

export function cleanMetadataDescription(text = "") {
    if (!text) return "";

    return text
        .replace(/\{.*?\}/g, "")
        .replace(/[#_*`>]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);
}