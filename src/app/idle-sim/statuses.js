import { getAffinityIndex } from "./util";

const STATUS_MATCH = {
    bonus_damage: (a, b) => false
}

export function applyStatus(data, state, targetState, status) {
    const existing = (targetState.statuses ?? []).find(st => {
        if (st.id === status.id) {
            const addedCheck = STATUS_MATCH[status.id];
            if (addedCheck) return addedCheck(st, status);
            return true;
        }
    });

    if (existing) {
        if (existing.value && status.value) existing.value += status.value;
        if (existing.until && status.ticks) existing.until = Math.max(existing.until, state.game_tick + status.ticks);
    } else {
        const statusType = data.statuses[status.id]?.type ?? null;
        targetState.statuses ??= [];
        targetState.statuses.push({
            type: status.type ?? statusType ?? "combat",
            ...status,
            until: status.ticks ? state.game_tick + status.ticks : undefined
        });
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
    },
    Fanatic: (stats, status, attackerState, defenderState) => {
        const nails = defenderState.statuses.find(st => st.id === "NCorpNail");
        if (!nails) return;
        stats.offense[getAffinityIndex("lust")] += Math.floor(nails.value / 2);
    },
    Disabled: (stats, status, attackerState, defenderState) => {
        stats.offense.fill(0);
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
        if (status.affinity) return damage;
        if (status.op === "mul") return damage * (1 + status.value);
        else if (status.op === "add") return damage + status.value;
        return damage;
    },
    reduce_damage: (damage, status, attackerState, defenderState) => {
        if (status.affinity) return damage;
        if (status.op === "mul") return damage * (1 - status.value);
        else if (status.op === "add") return damage - status.value;
        return damage;
    },
    Disabled: (damage, status, attackerState, defenderState) => {
        return 0;
    }
}

const DEFENDER_DAMAGE_STATUSES = {
    bonus_damage_taken: (damage, status, attackerState, defenderState) => {
        if (status.affinity) return damage;
        if (status.op === "mul") return damage * (1 + status.value);
        else if (status.op === "add") return damage + status.value;
    }
}

export function resolveDamageStatuses(damage, attackerState, defenderState) {
    let result = damage;
    for (const status of (attackerState.statuses ?? [])) {
        const handler = ATTACKER_DAMAGE_STATUSES[status.id];
        if (handler) result = handler(result, status, attackerState, defenderState);
    }

    for (const status of (defenderState.statuses ?? [])) {
        const handler = DEFENDER_DAMAGE_STATUSES[status.id];
        if (handler) result = handler(result, status, attackerState, defenderState);
    }

    return result;
}

const TICK_END_STATUSES = {
    Urge: (data, state, status, owner) => {
        if (status.value >= 5) {
            owner.sp -= 15;
            owner.statuses = owner.statuses.filter(st => st.id !== "Urge");
            applyStatus(data, state, owner, { id: "bonus_damage_taken", op: "mul", value: 0.2 });
        }
    },
    NCorpNail: (data, state, status, owner) => {
        owner.hp -= status.value;
        status.value -= 1;
        if (status.value === 0) owner.statuses = owner.statuses.filter(st => st.id !== "NCorpNail");
    },
    Fanatic: (data, state, status, owner) => {
        owner.statuses = owner.statuses.filter(st => st.id !== "Fanatic");
    },
    Poison: (data, state, status, owner) => {
        owner.hp -= status.value;
        status.value = Math.floor(status.value / 2);
        if (status.value === 0) owner.statuses = owner.statuses.filter(st => st.id !== "Poison");
    }
}

export function resolveTickEndStatuses(data, state, agents) {
    for (const agent of agents) {
        for (const status of (agent.statuses ?? [])) {
            TICK_END_STATUSES[status.id]?.(data, state, status, agent);
        }
    }
}

export function resolveEnemyTickEndStatuses(data, state, enemies) {
    for (const enemy of enemies) {
        for (const status of (enemy.statuses ?? [])) {
            TICK_END_STATUSES[status.id]?.(data, state, status, enemy);
        }
    }
}
