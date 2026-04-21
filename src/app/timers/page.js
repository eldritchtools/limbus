"use client";

import { useMemo } from "react";

import DaysSinceTable from "./DaysSinceTable";
import TimersTable from "./TimersTable";
import { useData } from "../components/DataProvider";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { keywords } from "../lib/constants";

export default function TimersPage() {
    const [identities, identitiesLoading] = useData("identities");
    const [egos, egosLoading] = useData("egos");
    const [timers, timersLoading] = useData("timers");

    const entries = useMemo(() => {
        if (identitiesLoading || egosLoading) return {};

        const results = {};

        const insertDefault = key => {
            results[key] = {
                "00": null,
                "000": null,
                identity: null,
                ZAYIN: null,
                TETH: null,
                HE: null,
                WAW: null,
                ego: null
            }
        }

        const handleEntry = (key, key2, item) => {
            if (!results[key][key2]) results[key][key2] = item.id;
            else {
                const current = results[key][key2];
                if (`${current}`[0] === '1') {
                    if (identities[current].date.localeCompare(item.date) <= 0) results[key][key2] = item.id;
                } else {
                    if (egos[current].date.localeCompare(item.date) <= 0) results[key][key2] = item.id;
                }
            }
        }

        Array.from({ length: 12 }, (_, i) => i).forEach(i => insertDefault(i + 1));
        keywords.slice(0, 7).forEach(kw => insertDefault(kw));

        Object.values(identities).forEach(identity => {
            const key = identity.sinnerId;
            handleEntry(key, "identity", identity);
            const rank = '0'.repeat(identity.rank);
            handleEntry(key, rank, identity);
            (identity.skillKeywordList || []).forEach(kw => {
                handleEntry(kw, "identity", identity);
                handleEntry(kw, rank, identity);
            })
        });

        const statusKeywordMapping = {
            "Combustion": "Burn",
            "Laceration": "Bleed",
            "Vibration": "Tremor",
            "Burst": "Rupture",
            "Sinking": "Sinking",
            "Breath": "Poise",
            "Charge": "Charge"
        };

        Object.values(egos).forEach(ego => {
            const key = ego.sinnerId;
            handleEntry(key, "ego", ego);
            const rank = ego.rank;
            handleEntry(key, rank, ego);
            (ego.statuses || []).forEach(kw => {
                if (kw in statusKeywordMapping) {
                    handleEntry(statusKeywordMapping[kw], "ego", ego);
                    handleEntry(statusKeywordMapping[kw], rank, ego);
                }
            });
        });

        return results;
    }, [identities, identitiesLoading, egos, egosLoading])

    if (identitiesLoading || egosLoading || timersLoading) return <LoadingContentPageTemplate />;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <h2 style={{ margin: 0 }}>Timers</h2>
        <span style={{ maxWidth: "1000px", textAlign: "center" }}>Timers for relevant dates in the game.</span>

        <h3 style={{ margin: 0 }}>Time Until (10AM KST):</h3>
        <TimersTable timers={timers} />

        <h3 style={{ margin: 0 }}>Days Since (12PM KST):</h3>
        <DaysSinceTable entries={entries} identities={identities} egos={egos} />
    </div>;
}
