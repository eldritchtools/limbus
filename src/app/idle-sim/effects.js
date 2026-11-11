import { applyStatus } from "./statuses";
import { checkConditions, getAffinityIndex, numberCompare } from "./util";

const VARS = {
    hp_percent: (data, state) => {
        return state.agent.hp / state.agent.max_hp;
    },
    target_hp_percent: (data, state) => {
        const enemy = state.enemy ?? state?.enemyState?.[state.enemyIndex];
        if (!enemy) return undefined;
        return enemy.hp / data.enemies[enemy.id].max_hp;
    }
}

const CONDITIONS = {
    always: (data, state, condition) => true,
    comp_var: (data, state, condition) => {
        const val = VARS[condition.var](data, state);
        if (val === undefined) return false;
        return numberCompare(val, condition.target, condition.comp);
    },
    random: (data, state, condition) => Math.random() < condition.chance,
    tick_mod: (data, state, condition) => {
        const tick = state.game_tick ?? state.state?.game_tick;
        return tick % condition.value === (condition.offset ?? 0);
    },
    on_kill: (data, state, condition) => state.enemyDefeated > 0,
    target_has_buff: (data, state, condition) => {
        if (!state.enemyState || state.enemyIndex === undefined) return false;
        const enemy = state.enemyState[state.enemyIndex];
        if (!enemy) return false;
        return (enemy.statuses ?? []).some(st => st.id === condition.id);
    }
};

function compileEffects(data, agent) {
    const weapon = data.weapons[agent.weapon];
    const armor = data.armor[agent.armor];
    const gifts = agent.gifts.map(id => data.gifts[id]).filter(x => x);
    return [...(weapon?.effects ?? []), ...(armor?.effects ?? []), ...(gifts.map(x => x.effects ?? []).flat())];
}

const STAT_EFFECTS = {
    offense: (stats, effect) => {
        stats.offense[getAffinityIndex(effect.affinity)] += effect.value;
    },
    offense_mult: (stats, effect) => {
        if (effect.affinity) stats.off_mult[getAffinityIndex(effect.affinity)] += effect.value;
        else stats.off_mult = stats.off_mult.map(x => x + effect.value);
    },
    defense: (stats, effect) => {
        if (effect.affinity) stats.defense[getAffinityIndex(effect.affinity)] += effect.value;
        else stats.defense = stats.defense.map(x => x + effect.value);
    }
};

export function resolveGearStatEffects(data, state, agent, stats, conditionals = true) {
    for (const effect of compileEffects(data, agent)) {
        if ("conditions" in effect || "effects" in effect) {
            const trueEffects = effect.effects.filter(effect => effect.type in STAT_EFFECTS);
            if (trueEffects.length === 0) continue;
            if (!conditionals) continue;
            if (!checkConditions(data, { state, agent }, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;

            for (const trueEffect of trueEffects) STAT_EFFECTS[trueEffect.type]?.(stats, trueEffect);
        } else {
            STAT_EFFECTS[effect.type]?.(stats, effect);
        }
    }
}

const DAMAGE_EFFECTS = {
    fixed_damage: (stats, damage, effect) => {
        damage.damageToEnemy += effect.value * stats.enemy.defense[getAffinityIndex(effect.affinity)];
    },
    bonus_damage: (stats, damage, effect) => {
        damage.damageToEnemy *= 1 + effect.value;
    },
    bonus_damage_taken: (stats, damage, effect) => {
        damage.damageToAgent *= 1 + effect.value;
    },
    reduce_damage_taken: (stats, damage, effect) => {
        damage.damageToAgent *= 1 - effect.value;
    }
};

export function resolveGearDamageEffects(data, state, stats, initDamageToEnemy, initDamageToAgent) {
    const damage = { damageToEnemy: initDamageToEnemy, damageToAgent: initDamageToAgent };

    for (const effect of compileEffects(data, state.agentState[state.agentIndex])) {
        if ("conditions" in effect || "effects" in effect) {
            const trueEffects = effect.effects.filter(effect => effect.type in DAMAGE_EFFECTS);
            if (trueEffects.length === 0) continue;
            if (!checkConditions(data, state, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;

            for (const trueEffect of trueEffects) DAMAGE_EFFECTS[trueEffect.type]?.(stats, damage, trueEffect);
        } else {
            DAMAGE_EFFECTS[effect.type]?.(stats, damage, effect);
        }
    }

    return damage;
}

const EXPEDITION_EFFECTS = {
    heal_hp: (data, state, effect) => {
        state.agent.hp += effect.value;
    },
    buff_self: (data, state, effect) => {
        applyStatus(data, state.state, state.agent, effect.status);
    },
    buff_target: (data, state, effect) => {
        if (effect.target === "random") {
            if (state.enemyState.length === 0) return;
            const enemy = state.enemyState[Math.floor(Math.random() * state.enemyState.length)];
            applyStatus(data, state.state, enemy, effect.status);
        } else if (effect.target === "all") {
            for (const enemy of state.enemyState) {
                applyStatus(data, state.state, enemy, effect.status);
            }
        }
    }
}

export function resolveGearExpeditionEffects(data, state) {
    for (const agent of state.agents) {
        for (const effect of compileEffects(data, agent)) {
            if ("conditions" in effect || "effects" in effect) {
                const trueEffects = effect.effects.filter(effect => effect.type in EXPEDITION_EFFECTS);
                if (trueEffects.length === 0) continue;
                if (!checkConditions(data, { ...state, agent }, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;

                for (const trueEffect of trueEffects) EXPEDITION_EFFECTS[trueEffect.type]?.(data, { ...state, agent }, trueEffect);
            } else {
                EXPEDITION_EFFECTS[effect.type]?.(data, { ...state, agent }, effect);
            }
        }
    }
}
