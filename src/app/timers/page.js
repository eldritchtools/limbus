"use client";

import { useMemo, useState } from "react";

import DaysSinceTable from "./DaysSinceTable";
import Roadmap from "./Roadmap";
import { kstToLocalTime } from "./timerFunc";
import TimersTable from "./TimersTable";
import { useData } from "../components/DataProvider";
import DragContainer from "../components/objects/DragContainer";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { keywords } from "../lib/constants";

export default function TimersPage() {
    const [identities, identitiesLoading] = useData("identities");
    const [egos, egosLoading] = useData("egos");
    const [timers, timersLoading] = useData("timers");
    const [show00, setShow00] = useState(false);

    const entries = useMemo(() => {
        if (identitiesLoading || egosLoading) return {};

        const results = {};

        const insertDefault = key => {
            results[key] = {
                "00": null,
                "000": null,
                // identity: null,
                ZAYIN: null,
                TETH: null,
                HE: null,
                WAW: null,
                // ego: null
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
        insertDefault("walp");

        Object.values(identities).forEach(identity => {
            const key = identity.sinnerId;
            // handleEntry(key, "identity", identity);
            const rank = '0'.repeat(identity.rank);
            handleEntry(key, rank, identity);
            (identity.skillKeywordList || []).forEach(kw => {
                // handleEntry(kw, "identity", identity);
                handleEntry(kw, rank, identity);
            })
            if(identity.season >= 9100) {
                handleEntry("walp", rank, identity);
            }
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
            // handleEntry(key, "ego", ego);
            const rank = ego.rank;
            handleEntry(key, rank, ego);
            (ego.statuses || []).forEach(kw => {
                if (kw in statusKeywordMapping) {
                    // handleEntry(statusKeywordMapping[kw], "ego", ego);
                    handleEntry(statusKeywordMapping[kw], rank, ego);
                }
            });
            if(ego.season >= 9100) {
                handleEntry("walp", rank, ego);
            }
        });

        return results;
    }, [identities, identitiesLoading, egos, egosLoading])

    if (identitiesLoading || egosLoading || timersLoading) return <LoadingContentPageTemplate />;

    const local10 = kstToLocalTime("10AM");
    const local12 = kstToLocalTime("12PM");

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Timers and Roadmap</h1>
        <span className="sub-text" style={{ textAlign: "center" }}>
            Timers for content, seasonal roadmap, and time since past releases of Identities and E.G.Os.
        </span>

        <h3 style={{ margin: 0 }}>Time Until (10AM KST • {local10} local):</h3>
        <DragContainer style={{ width: "max-content", maxWidth: "100%" }}>
            <TimersTable timers={timers} />
        </DragContainer>

        <h3 style={{ margin: 0 }}>Season Roadmap:</h3>
        <DragContainer>
            <Roadmap />
        </DragContainer>

        <h3 style={{ margin: 0 }}>Days Since (12PM KST • {local12} local):</h3>
        <div>
            <label>
                <input type="checkbox" checked={show00} onChange={e => setShow00(e.target.checked)}/>
                Show 00s
            </label>
        </div>
        <DaysSinceTable entries={entries} identities={identities} egos={egos} show00={show00} />
    </div>;
}
