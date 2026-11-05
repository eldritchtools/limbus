import { getAffinityIndex } from "./util";

const ATTACKER_DAMAGE_STATUSES = {
    bonus_damage: (damage, status, attackerState, defenderState) => {
        damage.offense[getAffinityIndex(status.affinity)] += status.value;
    }
}

const DEFENDER_DAMAGE_STATUSES = {
}

export function resolveDamageStatuses(initOffense, initDefense, attackerState, defenderState) {
    const damage = { offense: [...initOffense], defense: [...initDefense] };
    
    for (const status of (attackerState.statuses ?? [])) {
        ATTACKER_DAMAGE_STATUSES[status.type]?.(damage, status, attackerState, defenderState);
    }

    for (const status of (defenderState.statuses ?? [])) {
        DEFENDER_DAMAGE_STATUSES[status.type]?.(damage, status, attackerState, defenderState);
    }

    return damage;
}