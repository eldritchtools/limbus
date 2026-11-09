import { getAffinityIndex } from "./util";

const STATUS_MATCH = {
    bonus_damage: (a, b) => a.op === b.op && a.affinity === b.affinity
}

export function applyStatus(state, targetState, status) {
    const existing = (targetState.statuses ?? []).find(st => {
        if (st.id === status.id) {
            const addedCheck = STATUS_MATCH[status.id];
            if (addedCheck) return addedCheck(st, status);
            return true;
        }
    });
    if (existing) {
        existing.value += status.value;
        if (existing.until && status.until) existing.until = Math.max(existing.until, state.game_tick + status.ticks);
    } else {
        targetState.statuses ??= [];
        targetState.statuses.push({ ...status, until: state.game_tick + status.ticks });
    }
}

const ATTACKER_DAMAGE_STAT_STATUSES = {
    bonus_damage: (stats, status, attackerState, defenderState) => {
        if (!status.affinity) return;
        if (status.op === "mul") stats.offense[getAffinityIndex(status.affinity)] *= 1 + status.value;
        else if (status.op === "add") stats.offense[getAffinityIndex(status.affinity)] += status.value;
    },
    reduce_damage: (stats, status, attackerState, defenderState) => {
        if (!status.affinity) return;
        if (status.op === "mul") stats.offense[getAffinityIndex(status.affinity)] *= 1 - status.value;
        else if (status.op === "add") stats.offense[getAffinityIndex(status.affinity)] -= status.value;
    }
}

const DEFENDER_DAMAGE_STAT_STATUSES = {
    bonus_damage_taken: (stats, status, attackerState, defenderState) => {
        if (!status.affinity) return;
        if (status.op === "mul") stats.defense[getAffinityIndex(status.affinity)] += status.value;
        else if (status.op === "add") stats.offense[getAffinityIndex(status.affinity)] += status.value;
    }
}

export function resolveDamageStatStatuses(offense, defense, attackerState, defenderState) {
    const stats = { offense: [...offense], defense: [...defense] }

    for (const status of (attackerState.statuses ?? [])) {
        ATTACKER_DAMAGE_STAT_STATUSES[status.id]?.(stats, status, attackerState, defenderState);
    }

    for (const status of (defenderState.statuses ?? [])) {
        DEFENDER_DAMAGE_STAT_STATUSES[status.id]?.(stats, status, attackerState, defenderState);
    }

    return stats;
}

const ATTACKER_DAMAGE_STATUSES = {
    bonus_damage: (damage, status, attackerState, defenderState) => {
        if (status.affinity) return;
        if (status.op === "mul") damage *= 1 + status.value;
        else if (status.op === "add") damage += status.value;
    },
    reduce_damage: (damage, status, attackerState, defenderState) => {
        if (status.affinity) return;
        if (status.op === "mul") damage *= 1 - status.value;
        else if (status.op === "add") damage -= status.value;
    }
}

const DEFENDER_DAMAGE_STATUSES = {
    bonus_damage_taken: (damage, status, attackerState, defenderState) => {
        if (status.affinity) return;
        if (status.op === "mul") damage *= 1 + status.value;
        else if (status.op === "add") damage += status.value;
    }
}

export function resolveDamageStatuses(damage, attackerState, defenderState) {
    for (const status of (attackerState.statuses ?? [])) {
        ATTACKER_DAMAGE_STATUSES[status.id]?.(damage, status, attackerState, defenderState);
    }

    for (const status of (defenderState.statuses ?? [])) {
        DEFENDER_DAMAGE_STATUSES[status.id]?.(damage, status, attackerState, defenderState);
    }

    return damage;
}

const TICK_END_STATUSES = {
    Desire: (status, state) => {
        if (status.value >= 5) {
            state.sp -= 15;
            state.statuses = state.statuses.filter(st => st.id !== "Desire");
        }
    }
}

export function resolveTickEndStatuses(agents) {
    for (const agent of agents) {
        for (const status of (agent.statuses ?? [])) {
            TICK_END_STATUSES[status.id]?.(status, agent);
        }
    }
}
