import { checkConditions, getAffinityIndex } from "./util";

const CONDITIONS = {
    "tick_mod": (data, state, condition) => state.game_tick % condition.value === 0,
    "on_kill": (data, state, condition) => state.defeated > 0
};

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
    for (const effect of compileEffects(data, agent)) {
        if ("conditions" in effect || "effects" in effect) {
            if (!checkConditions(data, state, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;

            for (const trueEffect of effect.effects) {
                STAT_EFFECTS[trueEffect.type]?.(stats, trueEffect);
            }
        } else {
            STAT_EFFECTS[effect.type]?.(stats, effect);
        }
    }
}

const DAMAGE_EFFECTS = {
    "fixed_damage": (stats, damage, effect) => {
        damage.damageToEnemy += effect.value * stats.enemy.defense[getAffinityIndex(effect.affinity)];
    }
};

export function resolveGearDamageEffects(data, state, stats, initDamageToEnemy, initDamageToAgent) {
    const damage = { damageToEnemy: initDamageToEnemy, damageToAgent: initDamageToAgent };

    for (const effect of compileEffects(data, state.agentState[state.agentIndex])) {
        if ("conditions" in effect || "effects" in effect) {
            if (!checkConditions(data, state, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;

            for (const trueEffect of effect.effects) {
                DAMAGE_EFFECTS[trueEffect.type]?.(stats, damage, trueEffect);
            }
        } else {
            DAMAGE_EFFECTS[effect.type]?.(stats, damage, effect);
        }
    }

    return damage;
}

const EXPEDITION_EFFECTS = {
    heal_hp: (data, state, effect) => {
        state.agent.hp += effect.value
    },
    bonus_damage: (data, state, effect) => {
        state.agent.statuses.push({ "type": "bonus_damage", "affinity": effect.affinity, "value": effect.value, "until": state.state.game_tick + effect.ticks })
    },
}

export function resolveGearExpeditionEffects(data, state) {
    for (const agent of state.agents) {
        for (const effect of compileEffects(data, agent)) {
            if ("conditions" in effect || "effects" in effect) {
                if (!checkConditions(data, { ...state, agent }, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;

                for (const trueEffect of effect.effects) {
                    EXPEDITION_EFFECTS[trueEffect.type]?.(data, { ...state, agent }, trueEffect);
                }
            } else {
                EXPEDITION_EFFECTS[effect.type]?.(data, { ...state, agent }, effect);
            }
        }
    }
}
