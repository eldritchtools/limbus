import { MAX_OFFLINE_TICKS } from "./util";

export function simulateTick(state) {
    return {
        ...state,
        game_tick: state.game_tick + 1,
        counter: state.counter + 1,
    };
}

export function simulateUntil(state, targetTick) {
    const elapsed = Math.max(0, targetTick - state.latest_simulated_tick);
    const count = Math.min(elapsed, MAX_OFFLINE_TICKS);

    let nextState = state;

    for (let i = 0; i < count; i++) {
        nextState = simulateTick(nextState);
    }

    return {
        ...nextState,
        latest_simulated_tick: Math.max(state.latest_simulated_tick, targetTick)
    };
}