import Dexie from "dexie";

export const db = new Dexie("limbus-team-building-hub");

db.version(1).stores({
    builds: "++id",
    lists: "++id",
    saves: "id",
    savedLists: "id",
    mdplans: "++id",
    savedplans: "id"
});

function makeStore(table) {
    return {
        save: obj => table.put(obj),
        get: key => table.get(key),
        getAll: () => table.toArray(),
        remove: key => table.delete(key),
        clear: () => table.clear()
    };
}

export const buildsStore = makeStore(db.builds);
export const savesStore = makeStore(db.saves);
export const listsStore = makeStore(db.lists);
export const savedListsStore = makeStore(db.savedLists);
export const mdPlansStore = makeStore(db.mdplans);
export const savedMdPlansStore = makeStore(db.savedplans);