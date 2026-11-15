import React, { useMemo, useState } from "react";

import { useData } from "@/app/components/DataProvider";
import IdentityIcon from "@/app/components/icons/IdentityIcon";
import DropdownButton from "@/app/components/objects/DropdownButton";
import { getGeneralTooltipProps } from "@/app/components/tooltips/GeneralTooltip";

export default function IdentitiesView({ data }) {
    const [sortBy, setSortBy] = useState("gp");
    const [reverse, setReverse] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [showPercentages, setShowPercentages] = useState(false);
    const [identities, identitiesLoading] = useData("identities_mini");
    const pctCheck = showPercentages ? 0.18 : 0.12;

    const [results, maxVotes] = useMemo(() => {
        const result = {};
        const ids = new Set();
        Object.keys(data.categories.idGameplay.votes).forEach(id => ids.add(id));
        Object.keys(data.categories.idNonGameplay.votes).forEach(id => ids.add(id));
        let maxVotes = 0;

        [...ids].forEach(id => {
            const gpVotes = data.categories.idGameplay.votes[id] ?? 0;
            const ngVotes = data.categories.idNonGameplay.votes[id] ?? 0;
            maxVotes = Math.max(maxVotes, Math.max(gpVotes, ngVotes));

            result[id] = {
                id, gpVotes, ngVotes,
                gpPct: (gpVotes / data.categories.idGameplay.answeredCount) * 100,
                ngPct: (ngVotes / data.categories.idNonGameplay.answeredCount) * 100,
                diffVotes: gpVotes - ngVotes,
                overlap: data.idOverlap[id] ?? 0
            }
        });

        return [result, maxVotes];
    }, [data]);

    const resultsSorted = useMemo(() => Object.values(results).sort((a, b) => {
        if (sortBy === "gp") return b.gpVotes - a.gpVotes || b.ngVotes - a.ngVotes;
        if (sortBy === "ng") return b.ngVotes - a.ngVotes || b.gpVotes - a.gpVotes;
        if (sortBy === "diff") return Math.abs(b.diffVotes) - Math.abs(a.diffVotes);
        if (sortBy === "same") return b.overlap - a.overlap;
        return 0;
    }), [results, sortBy]);

    if (identitiesLoading) return null;

    return <>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div
                style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}
                {...getGeneralTooltipProps("Sort Options\nGameplay: Most voted for gameplay\nNon-Gameplay: Most voted for non-gameplay\nDifference: Highest difference between gameplay and non-gameplay votes\nSame Votes: Highest number of respondents who voted the identity for both categories")}
            >
                <div>Sort by:</div>
                <DropdownButton value={sortBy} setValue={setSortBy} options={{ gp: "Gameplay", ng: "Non-Gameplay", diff: "Difference", same: "Same Votes" }} />
            </div>
            <div>
                <label>
                    <input type="checkbox" checked={reverse} onChange={e => setReverse(e.target.checked)} />
                    <span>Reverse?</span>
                </label>
            </div>
            <div>
                <label>
                    <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} />
                    <span>Show All?</span>
                </label>
            </div>
            <div>
                <label>
                    <input type="checkbox" checked={showPercentages} onChange={e => setShowPercentages(e.target.checked)} />
                    <span>Show Percentages?</span>
                </label>
            </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", fontSize: "0.8rem" }}>
            <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                <span style={{ color: "#2563eb" }}>■</span>
                <span>Gameplay Only</span>
            </div>
            <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                <span style={{ color: "#7c3aed" }}>■</span>
                <span>Voted both</span>
            </div>
            <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                <span style={{ color: "#ea580c" }}>■</span>
                <span>Non-Gameplay Only</span>
            </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 3rem 1fr", gap: "0.2rem", alignItems: "center", width: "100%", maxWidth: "1200px" }}>
            <span style={{ fontWeight: "bold", textAlign: "center" }}>Gameplay ({data.categories.idGameplay.answeredCount} respondents)</span>
            <span style={{ fontWeight: "bold", textAlign: "center" }}>Diff</span>
            <span style={{ fontWeight: "bold", textAlign: "center" }}>Non-Gameplay ({data.categories.idNonGameplay.answeredCount} respondents)</span>

            {(reverse ? resultsSorted.toReversed() : resultsSorted).slice(0, showAll ? undefined : 10).map(res => <React.Fragment key={res.id}>
                <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <IdentityIcon id={res.id} size={24} />
                    <span style={{ fontWeight: "bold" }}>{identities[res.id].name}</span>
                </div>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.35rem",
                    backgroundColor: "rgba(255, 255, 255, 0.05)"
                }}>
                    {res.gpVotes / maxVotes < pctCheck && <span style={{ fontWeight: "bold" }}>{res.gpVotes}{showPercentages ? ` (${(res.gpPct).toFixed(2)}%)` : null}</span>}
                    {res.gpVotes > 0 &&
                        <div style={{ position: "relative", display: "flex", width: `${(res.gpVotes / maxVotes) * 100}%`, height: "1.5rem" }}>
                            <div style={{ width: `${((res.gpVotes - res.overlap) / res.gpVotes) * 100}%`, backgroundColor: "#2563eb", "borderRadius": "4px 0 0 4px" }} />
                            <div style={{ width: `${(res.overlap / res.gpVotes) * 100}%`, backgroundColor: "#7c3aed" }} />
                            {res.gpVotes / maxVotes >= pctCheck &&
                                <span style={{ position: "absolute", left: "0.3rem", top: "50%", transform: "translateY(-50%)", fontWeight: "bold" }}>
                                    {res.gpVotes}{showPercentages ? ` (${(res.gpPct).toFixed(2)}%)` : null}
                                </span>
                            }
                        </div>
                    }
                </div>
                <div style={{ display: "flex", justifyContent: "center", fontWeight: "bold" }}>
                    {res.diffVotes > 0 && <span style={{ color: "#60a5fa" }}>🡄 {res.diffVotes}</span>}
                    {res.diffVotes < 0 && <span style={{ color: "#fb923c" }}>{-res.diffVotes} 🡆</span>}
                    {res.diffVotes === 0 && <span stylee={{ opacity: 0.7 }}>0</span>}
                </div>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "0.35rem",
                    backgroundColor: "rgba(255, 255, 255, 0.05)"
                }}>
                    {res.ngVotes > 0 &&
                        <div style={{ position: "relative", display: "flex", width: `${(res.ngVotes / maxVotes) * 100}%`, height: "1.5rem" }}>
                            <div style={{ width: `${(res.overlap / res.ngVotes) * 100}%`, backgroundColor: "#7c3aed" }} />
                            <div style={{ width: `${((res.ngVotes - res.overlap) / res.ngVotes) * 100}%`, backgroundColor: "#ea580c", borderRadius: "0 4px 4px 0" }} />
                            {res.ngVotes / maxVotes >= pctCheck &&
                                <span style={{ position: "absolute", right: "0.3rem", top: "50%", transform: "translateY(-50%)", fontWeight: "bold" }}>
                                    {res.ngVotes}{showPercentages ? ` (${(res.ngPct).toFixed(2)}%)` : null}
                                </span>
                            }
                        </div>
                    }
                    {res.ngVotes / maxVotes < pctCheck && <span style={{ fontWeight: "bold" }}>{res.ngVotes}{showPercentages ? ` (${(res.ngPct).toFixed(2)}%)` : null}</span>}
                </div>
            </React.Fragment>)}
        </div>
    </>
}