import { getAffinityIndex } from "./util";

const CONDITIONS = {
    "tick_mod": (data, state, condition) => state.game_tick % condition.value === 0,
    "on_kill": (data, state, condition) => state.defeated > 0
};

function checkConditions(data, state, conditions, op = "and") {
    if (!conditions) return true;

    if (op === "and") {
        return conditions.every(condition => CONDITIONS[condition.type]?.(data, state, condition))
    } else if (op === "or") {
        return conditions.some(condition => CONDITIONS[condition.type]?.(data, state, condition))
    }

    return false;
}

function compileEffects(data, agent) {
    const weapon = data.weapons[agent.weapon];
    const armor = data.armor[agent.armor];
    const gifts = agent.gifts.map(id => data.gifts[id]).filter(x => x);
    return [...(weapon?.effects ?? []), ...(armor?.effects ?? []), ...(gifts.map(x => x.effects ?? []).flat())];
}

const STAT_EFFECTS = {
    "offense": (stats, effect) => {
        stats.offense[getAffinityIndex(effect.affinity)] += effect.value;
    },
    "offense_mult": (stats, effect) => {
        stats.off_mult[getAffinityIndex(effect.affinity)] += effect.value;
    },
    "defense": (stats, effect) => {
        stats.defense[getAffinityIndex(effect.affinity)] += effect.value;
    }
};

export function resolveGearStatEffects(data, state, agent, stats) {
    for (const effect in compileEffects(data, agent)) {
        if ("conditions" in effect || "effects" in effect) {
            if (!checkConditions(data, { ...state }, effect.conditions, effect.conditionOp ?? "and")) continue;

            for (const trueEffect in effect.effects) {
                STAT_EFFECTS[trueEffect.type]?.(stats, trueEffect.effects);
            }
        } else {
            STAT_EFFECTS[effect.type]?.(stats, effect);
        }
    }
}

const DAMAGE_EFFECTS = {
    "fixed_damage": (damage, effect) => {
        damage.damageToEnemy[getAffinityIndex(effect.affinity)] += effect.value;
    }
};

export function resolveGearDamageEffects(data, state, initDamageToEnemy, initDamageToAgent) {
    const damage = { damageToEnemy: initDamageToEnemy, damageToAgent: initDamageToAgent };

    for (const effect in compileEffects(data, state.agentState[state.agentIndex])) {
        if ("conditions" in effect || "effects" in effect) {
            if (!checkConditions(data, state, effect.conditions, effect.conditionOp ?? "and")) continue;

            for (const trueEffect in effect.effects) {
                DAMAGE_EFFECTS[trueEffect.type]?.(damage, trueEffect.effects);
            }
        } else {
            DAMAGE_EFFECTS[effect.type]?.(damage, effect);
        }
    }

    return damage;
}

const EXPEDITION_EFFECTS = {
    heal_hp: (data, state, effect) => {
        state.agent.hp += effect.value
    },
    bonus_damage: (data, state, effect) => {
        state.agent.statuses.push({ "type": "bonus_damage", "affinity": effect.affinity, "value": effect.value, "until": state.game_tick + effect.ticks })
    },
}

export function resolveGearExpeditionEffects(data, state) {
    for (const agent in state.agents) {
        for (const effect of compileEffects(data, agent)) {
            if (!checkConditions(data, { ...state, agent }, effect.conditions, effect.conditionOp ?? "and")) continue;
            for (const trueEffect of effect.effects) {
                EXPEDITION_EFFECTS[trueEffect.type]?.(data, { ...state, agent }, trueEffect);
            }
        }
    }
}
