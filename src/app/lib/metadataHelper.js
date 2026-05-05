import { LRUCache } from "lru-cache";

import { getSupabase } from "../database/connection";
import { DATA_ROOT } from "../paths";


const cache = new LRUCache({ max: 500, ttl: 1000 * 60 * 60 });

async function getFromDatabase(table, id) {
    const key = `${table}:${id}`;
    const cached = cache.get(key);
    if (cached) return { status: "ok", data: cached };

    const { data, error } = await getSupabase()
        .from(table)
        .select("id, title, body")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        return { status: "error", data: null };
    }

    if (!data) {
        return { status: "not_found", data: null };
    }

    cache.set(key, data);
    return { status: "ok", data };
}

export const getBuildForMetadata = async id => getFromDatabase("builds", id);
export const getCollectionForMetadata = async id => getFromDatabase("collections", id);
export const getMdPlanForMetadata = async id => getFromDatabase("md_plans", id);

const getJsonForMetadata = async (path) => {
    const base = process.env.NODE_ENV === "development" ? `http://localhost:3000${DATA_ROOT}` : DATA_ROOT;
    const res = await fetch(`${base}/${path}.json`, { next: { revalidate: 3600 } });
    const json = await res.json();
    return json;
}

export const getIdentitiesForMetadata = async () => await getJsonForMetadata("identities_mini");
export const getEgosForMetadata = async () => await getJsonForMetadata("egos_mini");
export const getEncountersForMetadata = async () => await getJsonForMetadata("encounters");

export function cleanMetadataDescription(text = "") {
    if (!text) return "";

    return text
        .replace(/\{.*?\}/g, "")
        .replace(/[#_*`>]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);
}