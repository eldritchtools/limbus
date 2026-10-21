export const SAVE_VERSION = 1;
export const MAX_OFFLINE_TICKS = 24 * 7;

const TICK_DURATION = 3_600_000;

export const TICK_CHECK_INTERVAL = 10_000;
export const AUTOSAVE_INTERVAL = 300_000;

export function getCurrentLocalTick(offsetMs = 0) {
    return Math.floor((Date.now() + offsetMs) / TICK_DURATION);
}

export function getClockOffset(serverTime) {
    return Date.parse(serverTime) - Date.now();
}

export function createInitialState(serverTick) {
    return {
        game_tick: 0,
        latest_simulated_tick: serverTick,
        counter: 0,
    };
}
