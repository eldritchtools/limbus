import { COUNTED_EVENT_TYPES, NOTABLE_EVENT_TYPES } from "./constants";

const entryTypeOf = (entry) => {
    if (entry.action === "work") return entry.outcome;
    if (entry.action === "break") return "break";
    return entry.statuses?.[0] ?? "down";
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