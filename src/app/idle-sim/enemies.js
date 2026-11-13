import { createEnemy } from "./expeditions";
import { applyStatus } from "./statuses";
import { checkConditions, getAffinityIndex, numberCompare } from "./util";

const VARS = {
    hp_percent: (data, state) => {
        const enemy = state.enemy ?? state.enemyState[state.enemyIndex];
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
    no_allies: (data, state, condition) => state.enemyState.length === 1,
    on_first_death: (data, state, condition) => {
        const enemy = state.enemy ?? state.enemyState[state.enemyIndex];
        if (enemy.deaths >= 1) return false;
        if (enemy.hp <= 0) {
            enemy.deaths = (enemy.deaths ?? 0) + 1;
            return true;
        }
        return false;
    },
    turns_alive: (data, state, condition) => {
        const enemy = state.enemy ?? state.enemyState[state.enemyIndex];
        enemy.turns_alive = (enemy.turns_alive ?? 0) + 1;
        return enemy.turns_alive >= condition.value;
    },
    on_kill: (data, state, condition) => state.agentDefeated > 0
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
            const trueEffects = effect.effects.filter(effect => effect.type in DAMAGE_STAT_EFFECTS);
            if (trueEffects.length === 0) continue;
            if (!checkConditions(data, { ...state, enemy }, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;

            for (const trueEffect of trueEffects) DAMAGE_STAT_EFFECTS[trueEffect.type]?.(i, enemyStats, trueEffect);
        }
    }
}

const DAMAGE_EFFECTS = {
    bonus_damage: (stats, damage, effect) => {
        if (effect.op === "mul") damage.damageToAgent *= 1 + effect.value;
        else damage.damageToAgent += effect.value;
    },
    bonus_damage_taken: (stats, damage, effect) => {
        if (effect.op === "mul") damage.damageToEnemy *= 1 + effect.value;
        else damage.damageToEnemy += effect.value;
    },
    reflect_damage: (stats, damage, effect) => {
        for (let i = 0; i < stats.agent.offense.length; i++) {
            damage.damageToAgent += stats.agent.offense[i] * stats.agent.defense[i] * (effect.value ?? 1);
        }
    }
};

export function resolveEnemyDamageEffects(data, state, stats, initDamageToEnemy, initDamageToAgent) {
    const damage = { damageToEnemy: initDamageToEnemy, damageToAgent: initDamageToAgent };

    for (const effect of data.enemies[state.enemyState[state.enemyIndex].id].effects ?? []) {
        const trueEffects = effect.effects.filter(effect => effect.type in DAMAGE_EFFECTS);
        if (trueEffects.length === 0) continue;
        if (!checkConditions(data, state, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;
        for (const trueEffect of trueEffects) DAMAGE_EFFECTS[trueEffect.type]?.(stats, damage, trueEffect);
    }

    return damage;
}

const PRE_DEATH_EFFECTS = {
    buff_self: (data, state, effect) => {
        applyStatus(data, state.state, state.enemy, effect.status);
    },
    heal_hp: (data, state, effect) => {
        state.enemy.hp += effect.value;
    }
};

export function resolveEnemyPreDeathEffects(data, state) {
    for (const effect of data.enemies[state.enemy.id].effects ?? []) {
        const trueEffects = effect.effects.filter(effect => effect.type in PRE_DEATH_EFFECTS);
        if (trueEffects.length === 0) continue;
        if (!checkConditions(data, state, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;
        for (const trueEffect of trueEffects) PRE_DEATH_EFFECTS[trueEffect.type]?.(data, state, trueEffect);
    }
}

const TICK_END_EFFECTS = {
    summon: (data, state, effect) => {
        state.enemyState.push(createEnemy(data, effect.id));
    },
    sp_damage: (data, state, effect) => {
        state.agents.forEach(agent => { agent.sp -= effect.value });
    },
    buff_self: (data, state, effect) => {
        applyStatus(data, state.state, state.enemy, effect.status);
    },
    buff_target: (data, state, effect) => {
        if (effect.target === "random") {
            if(state.agents.length === 0) return;
            const agent = state.agents[Math.floor(Math.random() * state.agents.length)];
            applyStatus(data, state.state, agent, effect.status );
        } else if (effect.target === "all") {
            for (const agent of state.agents) {
                applyStatus(data, state.state, agent, effect.status );
            }
        }
    },
    buff_ally: (data, state, effect) => {
        if (effect.target === "random") {
            const enemy = state.enemyState[Math.floor(Math.random() * state.enemyState.length)];
            applyStatus(data, state.state, enemy, effect.status );
        } else if (effect.target === "all") {
            for (const enemy of state.enemyState) {
                applyStatus(data, state.state, enemy, effect.status );
            }
        }
    },
    incapacitate_all_agents: (data, state, effect) => {
        state.agents.forEach(agent => { agent.hp = 0; })
    }
};

export function resolveEnemyTickEndEffects(data, state) {
    for (let i = 0; i < state.enemyState.length; i++) {
        const enemy = state.enemyState[i];
        for (const effect of data.enemies[enemy.id].effects ?? []) {
            const trueEffects = effect.effects.filter(effect => effect.type in TICK_END_EFFECTS);
            if (trueEffects.length === 0) continue;
            if (!checkConditions(data, { ...state, enemy }, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;
            for (const trueEffect of trueEffects) TICK_END_EFFECTS[trueEffect.type]?.(data, {...state, enemy}, trueEffect);
        }
    }
}