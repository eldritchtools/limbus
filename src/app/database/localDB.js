"use client";

import Dexie from "dexie";

export const db = new Dexie("limbus-company-tools");

const itemStores = ["builds", "collections", "mdPlans"];
const savedStores = ["savedBuilds", "savedCollections", "savedMdPlans"];
const singleStores = ["achievements"]

db.version(1).stores(
    {
        ...Object.fromEntries(itemStores.map(x => [x, "++id"])),
        ...Object.fromEntries(savedStores.map(x => [x, "id"])),
        ...Object.fromEntries(singleStores.map(x => [x, "id"]))
    }
);

function makeStore(table) {
    return {
        save: obj => table.put(obj),
        get: key => table.get(key),
        getAll: () => table.toArray(),
        remove: key => table.delete(key),
        clear: () => table.clear(),
        isEmpty: () => table.count() === 0
    };
}

export const localStores = {
    ...Object.fromEntries(itemStores.map(x => [x, makeStore(db[x])])),
    ...Object.fromEntries(savedStores.map(x => [x, makeStore(db[x])])),
    ...Object.fromEntries(singleStores.map(x => [x, makeStore(db[x])]))
}

export function isLocalId(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(id);
}