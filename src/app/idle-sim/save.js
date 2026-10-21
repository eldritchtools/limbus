import { gzipSync, gunzipSync, strToU8, strFromU8 } from "fflate";

import { getCurrentLocalTick, SAVE_VERSION } from "./util";
import { getLocalStore } from "../database/localDB";
import { callRPC } from "../database/supabaseTemplates";

function encodeBase64(bytes) {
    let binary = "";
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    return btoa(binary);
}

function decodeBase64(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}

export function encodeSave(state) {
    const json = JSON.stringify(state);
    const compressed = gzipSync(strToU8(json));

    return encodeBase64(compressed);
}

export function decodeSave(saveData) {
    const compressed = decodeBase64(saveData);
    const json = strFromU8(gunzipSync(compressed));

    return JSON.parse(json);
}

export async function loadDBGame() {
    const data = await callRPC("load_idle_game_save");
    const row = data?.[0];
    if (!row) throw new Error("Failed to load idle game save.");

    let state = null;
    if (row.save_data !== null) {
        if (row.save_version !== SAVE_VERSION)
            throw new Error(`Unsupported save version: ${row.save_version}`);
        state = decodeSave(row.save_data);
    }

    return {
        state,
        revision: row.revision,
        serverTime: row.server_time,
        serverTick: Number(row.server_tick),
        updatedAt: row.updated_at,
    };
}

export async function loadLocalGame() {
    const data = await getLocalStore("idleSim").get("main");
    const now = new Date();

    return {
        state: data ? decodeSave(data.save_data) : null,
        revision: data?.revision ?? null,
        serverTime: now.toISOString(),
        serverTick: getCurrentLocalTick(),
        updatedAt: data?.updated_at ?? null,
    };
}

export async function saveDBGame(state, revision) {
    const saveData = encodeSave(state);
    const data = await callRPC("save_idle_game_save", {
        p_save_version: SAVE_VERSION,
        p_save_data: saveData,
        p_expected_revision: revision,
    });

    const row = data?.[0];
    if (!row) throw new Error("Failed to save idle game.");

    return {
        revision: row.new_revision,
        serverTime: row.server_time,
        serverTick: Number(row.server_tick),
        updatedAt: row.updated_at,
    };
}

export async function saveLocalGame(state, revision) {
    const now = new Date().toISOString();

    const data = {
        id: "main",
        save_data: encodeSave(state),
        revision: (revision ?? 0) + 1,
        updated_at: now
    };

    await getLocalStore("idleSim").save(data);

    return {
        revision: data.revision,
        serverTime: now,
        serverTick: getCurrentLocalTick(),
        updatedAt: now,
    };
}

export async function resetDBGame() {
    await callRPC("reset_idle_game_save");
}

export async function resetLocalGame() {
    await getLocalStore("idleSim").remove("main");
}