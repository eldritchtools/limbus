import { createEnemy } from "./expeditions";
import { checkConditions, getAffinityIndex } from "./util";

const CONDITIONS = {
    no_allies: (data, state, condition) => state.enemyState.length === 1,
    hp_percent_ge: (data, state, condition) => {
        const enemy = state.enemy ?? state.enemyState[state.enemyIndex];
        return enemy.hp >= data.enemies[enemy.id].max_hp * condition.value;
    },
    hp_percent_lt: (data, state, condition) => {
        const enemy = state.enemy ?? state.enemyState[state.enemyIndex];
        return enemy.hp < data.enemies[enemy.id].max_hp * condition.value;
    },
};

const DAMAGE_STAT_EFFECTS = {
    add_damage_stat: (index, enemyStats, effect) => {
        enemyStats[index].offense[getAffinityIndex(effect.affinity)] += effect.value;
    }
};

export function resolveEnemyDamageStatEffects(data, state, enemyStats) {
    for (let i = 0; i < state.enemyState.length; i++) {
        const enemy = state.enemyState[i];
        for (const effect of data.enemies[enemy.id].effects ?? []) {
            if (!checkConditions(data, { ...state, enemy }, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;
            for (const trueEffect of effect.effects) {
                DAMAGE_STAT_EFFECTS[trueEffect.type]?.(i, enemyStats, trueEffect);
            }
        }
    }
}

const DAMAGE_EFFECTS = {

};

export function resolveEnemyDamageEffects(data, state, stats, initDamageToEnemy, initDamageToAgent) {
    const damage = { damageToEnemy: initDamageToEnemy, damageToAgent: initDamageToAgent };

    for (const effect of data.enemies[state.enemyState[state.enemyIndex].id].effects ?? []) {
        if (!checkConditions(data, state, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;
        for (const trueEffect of effect.effects) {
            DAMAGE_EFFECTS[trueEffect.type]?.(stats, damage, trueEffect);
        }
    }

    return damage;
}

const TICK_END_EFFECTS = {
    summon: (data, state, effect) => {
        state.enemyState.push(createEnemy(data, effect.id));
    }
};

export function resolveEnemyTickEndEffects(data, state) {
    for (let i = 0; i < state.enemyState.length; i++) {
        const enemy = state.enemyState[i];
        for (const effect of data.enemies[enemy.id].effects ?? []) {
            if (!checkConditions(data, { ...state, enemy }, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;
            for (const trueEffect of effect.effects) {
                TICK_END_EFFECTS[trueEffect.type]?.(data, state, trueEffect);
            }
        }
    }
}