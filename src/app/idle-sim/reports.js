import { COUNTED_EVENT_TYPES, MIN_TICKS, NOTABLE_EVENT_TYPES } from "./constants";

const entryTypeOf = (entry) => {
    if (entry.action === "work") return entry.outcome;
    if (entry.action === "break") return "break";
    return entry.statuses?.[0]?.type ?? "down";
};

export function summarizeReports(reports, from, to) {
    const slice = reports.filter(r => r.tick >= from && r.tick <= to);
    const ticks = to - from + 1;

    const totals = { currency: 0, xp: 0, entryTypes: {} };
    const agents = {};
    const subjects = {};
    const events = { notable: [], counts: {} };
    const allEvents = [];

    for (const report of slice) {
        const i = report.tick - from;

        for (const entry of report.entries) {
            const entryType = entryTypeOf(entry);
            const agent = agents[entry.agent_id] ??= { cells: Array(ticks).fill(null), currency: 0, xp: 0, entryTypes: {} };

            agent.cells[i] = { entryType, subject_id: entry.subject_id, currency: entry.currency, xp: entry.xp };
            agent.entryTypes[entryType] = (agent.entryTypes[entryType] ?? 0) + 1;
            totals.entryTypes[entryType] = (totals.entryTypes[entryType] ?? 0) + 1;

            if (entry.action === "work") {
                agent.currency += entry.currency; agent.xp += entry.xp;
                totals.currency += entry.currency; totals.xp += entry.xp;
                const subject = subjects[entry.subject_id] ??= { good: 0, avg: 0, bad: 0, currency: 0 };
                subject[entry.outcome] += 1;
                subject.currency += entry.currency;
            }
        }

        for (const event of report.events) {
            if (NOTABLE_EVENT_TYPES.has(event.type) || COUNTED_EVENT_TYPES.has(event.type)) allEvents.push({ tick: report.tick, ...event });
        }
    }

    for (const [id, agent] of Object.entries(agents)) {
        if (Object.keys(agent.entryTypes).every(type => type === "break")) delete agents[id];
    }

    for (const event of allEvents) {
        if (event.agent_id !== undefined && !agents[event.agent_id]) continue;
        if (NOTABLE_EVENT_TYPES.has(event.type)) events.notable.push(event);
        else events.counts[event.type] = (events.counts[event.type] ?? 0) + 1;
    }

    return { from, ticks, totals, agents, subjects, events };
}

export function getReportRange(state, arrivalTick, choice) {
    const to = state.game_tick - 1;
    const oldest = state.reports[0]?.tick ?? to;
    let from = choice === "arrival" ? arrivalTick : choice === "all" ? oldest : to - choice + 1;
    from = Math.max(from, oldest);
    from = Math.min(from, to - MIN_TICKS + 1);
    return [from, to];
}

const EVENT_TEXT = {
    died: data => `${data.agentName} died`,
    incapacitated: data => `${data.agentName} was incapacitated`,
    panic: data => `${data.agentName} panicked`,
    level_up: data => `Agent ${data.agentName} leveled up (level ${data.event.level})`,
    research_level_up: data => `Subject ${data.subjectName} leveled up (level ${data.event.level})`
};

export function getReportEventText(data, state, event) {
    const tempData = {
        agentName: state.agents[event.agent_id]?.name ?? `Agent ${event.agent_id}`,
        subjectName: data.subjects[event.subject_id]?.name,
        event
    }

    const h = state.game_tick - 1 - event.tick;

    return {
        time: (h >= 24 && h % 24 !== 0) ? `${Math.floor(h / 24)}d ${h % 24}h` : h >= 24 ? `${h / 24}d` : `${h}h`,
        text: EVENT_TEXT[event.type]?.(tempData) ?? event.type
    }

    // { summary.events.notable.map((e, i) => <div key={i}>{EVENT_TEXT[e.type](e)} <small>{ago(e.tick)}</small></div>) }
    // <small>{[["level_up", "level-ups"], ["research_level_up", "research level-ups"], ["recovered", "recoveries"]]
    //     .filter(([k]) => summary.events.counts[k]).map(([k, label]) => `${summary.events.counts[k]} ${label}`).join(" · ")}</small>
}