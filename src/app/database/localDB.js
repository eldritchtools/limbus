import Dexie from "dexie";

export const db = new Dexie("limbus-company-tools");

const itemStores = ["builds", "collections", "mdPlans"];
const savedStores = ["savedBuilds", "savedCollections", "savedMdPlans"];

db.version(1).stores(
    {
        ...Object.fromEntries(itemStores.map(x => [x, "++id"])),
        ...Object.fromEntries(savedStores.map(x => [x, "id"]))
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
    ...Object.fromEntries(savedStores.map(x => [x, makeStore(db[x])]))
}
