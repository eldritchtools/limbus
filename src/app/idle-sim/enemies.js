import { createEnemy } from "./expeditions";
import { getAgentEffectiveStats } from "./gear";
import { applyStatus } from "./statuses";
import { checkConditions, evaluateTarget, getAffinityIndex, numberCompare } from "./util";

const VARS = {
    hp_percent: (data, state) => {
        const enemy = state.enemy ?? state.enemyState[state.enemyIndex];
        if (!enemy) return undefined;
        return enemy.hp / data.enemies[enemy.id].max_hp;
    },
    enemies_count: (data, state) => {
        return state.enemyState.length;
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
    no_allies: (data, state, condition) => state.enemyState.length === 1,
    on_death: (data, state, condition) => {
        const enemy = state.enemy ?? state.enemyState[state.enemyIndex];
        return enemy.hp <= 0;
    },
    turns_alive: (data, state, condition) => {
        const enemy = state.enemy ?? state.enemyState[state.enemyIndex];
        enemy.first_tick ??= state.state.game_tick;
        return state.state.game_tick - enemy.first_tick + 1 >= condition.value;
    },
    on_kill: (data, state, condition) => state.agentDefeated > 0,
    agent_any_offense: (data, state, condition) => {
        return state.agents.some(agent => {
            const stats = getAgentEffectiveStats(data, state, agent, false);
            return condition.affinities.some(affinity => numberCompare(stats.offense[getAffinityIndex(affinity)], condition.target, condition.comp));
        });
    },
    once: (data, state, condition) => {
        const enemy = state.enemy ?? state.enemyState[state.enemyIndex];
        if ((enemy.flags ?? {})[condition.id]) return false;
        enemy.flags = { ...(enemy.flags ?? {}), [condition.id]: true }
        return true;
    }
};

const DAMAGE_STAT_EFFECTS = {
    add_damage_stat: (index, state, enemyStats, effect) => {
        const value = effect.valuePer ? (effect.valuePer * state.enemyState.filter(x => x.id === effect.id).length) : effect.value;
        enemyStats[index].offense[getAffinityIndex(effect.affinity)] += value;
    }
};

export function resolveEnemyDamageStatEffects(data, state, enemyStats) {
    for (let i = 0; i < state.enemyState.length; i++) {
        const enemy = state.enemyState[i];
        for (const effect of data.enemies[enemy.id].effects ?? []) {
            const trueEffects = effect.effects.filter(effect => effect.type in DAMAGE_STAT_EFFECTS);
            if (trueEffects.length === 0) continue;
            if (!checkConditions(data, { ...state, enemy }, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;

            for (const trueEffect of trueEffects) DAMAGE_STAT_EFFECTS[trueEffect.type]?.(i, { ...state, enemy }, enemyStats, trueEffect);
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
    },
    heal_hp_per_enemy: (data, state, effect) => {
        state.enemy.hp += effect.valuePer * state.enemyState.filter(x => x.id === effect.id).length;
    },
    set_hp_percent: (data, state, effect) => {
        state.enemy.hp = data.enemies[state.enemy.id].max_hp * effect.value;
    },
    fixed_damage_ally: (data, state, effect) => {
        if (effect.target.startsWith("id:")) {
            const id = effect.target.slice(3);
            for (const enemy of state.enemyState) {
                if (enemy.id === id) enemy.hp -= effect.value;
            }
        }
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
        const targets = evaluateTarget(state.agents, effect.target);
        for (const agent of targets) {
            agent.sp -= effect.value;
        }
    },
    sp_damage_per_enemy: (data, state, effect) => {
        const sp = effect.valuePer * state.enemyState.filter(x => x.id === effect.id).length;
        const targets = evaluateTarget(state.agents, effect.target);
        for (const agent of targets) {
            agent.sp -= sp;
        }
    },
    buff_self: (data, state, effect) => {
        applyStatus(data, state.state, state.enemy, effect.status);
    },
    buff_target: (data, state, effect) => {
        const target = effect.target === "highest_hp_agent" ? "highest_hp" : effect.target;
        const targets = evaluateTarget(state.agents, target);
        for (const agent of targets) {
            applyStatus(data, state.state, agent, effect.status);
        }
    },
    buff_ally: (data, state, effect) => {
        if (effect.target === "random_except_self") {
            const options = state.enemyState.filter(x => x.id !== state.enemy.id);
            const targets = evaluateTarget(options, "random");
            for (const enemy of targets) {
                applyStatus(data, state.state, enemy, effect.status);
            }
        } else {
            const targets = evaluateTarget(state.enemyState, effect.target);
            for (const enemy of targets) {
                applyStatus(data, state.state, enemy, effect.status);
            }
        }
    },
    incapacitate_all_agents: (data, state, effect) => {
        state.agents.forEach(agent => { agent.hp = 0; })
    },
    fixed_damage: (data, state, effect) => {
        const target = effect.target === "highest_hp_agent" ? "highest_hp" : effect.target;
        const targets = evaluateTarget(state.agents, target);
        for (const agent of targets) {
            agent.hp -= effect.value;
        }
    }
};

export function resolveEnemyTickEndEffects(data, state) {
    for (let i = 0; i < state.enemyState.length; i++) {
        const enemy = state.enemyState[i];
        for (const effect of data.enemies[enemy.id].effects ?? []) {
            const trueEffects = effect.effects.filter(effect => effect.type in TICK_END_EFFECTS);
            const falseEffects = (effect.falseEffects ?? []).filter(effect => effect.type in TICK_END_EFFECTS);
            if (trueEffects.length === 0 && falseEffects.length === 0) continue;
            if (checkConditions(data, { ...state, enemy }, CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) {
                for (const trueEffect of trueEffects) TICK_END_EFFECTS[trueEffect.type]?.(data, { ...state, enemy }, trueEffect);
            } else {
                for (const trueEffect of falseEffects) TICK_END_EFFECTS[trueEffect.type]?.(data, { ...state, enemy }, trueEffect);
            }
        }
    }
}