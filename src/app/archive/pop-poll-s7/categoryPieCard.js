import React, { useMemo, useState } from "react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#84cc16", "#f97316",];
const OTHER_COLOR = "#4b5563";

function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function buildSlicePath(cx, cy, r, startDeg, endDeg) {
    const [x1, y1] = polarToCartesian(cx, cy, r, startDeg);
    const [x2, y2] = polarToCartesian(cx, cy, r, endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

export default function CategoryPieCard({ title, category, maxSlices = 6, renderLabel = (id) => id, onItemClick = null }) {
    const [hoveredId, setHoveredId] = useState(null);
    const [showAll, setShowAll] = useState(false);

    const { allItems, slices } = useMemo(() => {
        if (!category?.votes || !category.totalPicks) return { allItems: [], slices: [] };

        const { answeredCount, totalPicks, votes } = category;
        const sorted = Object.entries(votes)
            .sort(([, a], [, b]) => b - a)
            .map(([id, count], idx) => ({
                id, rank: idx + 1, votes: count,
                pctOfPicks: (count / totalPicks) * 100,
                pctOfVoters: answeredCount ? (count / answeredCount) * 100 : 0,
            }));

        const nonzero = sorted.filter(x => x.votes > 0);

        let cutoff = Math.min(maxSlices, nonzero.length);
        while (cutoff < nonzero.length && nonzero[cutoff].votes === nonzero[cutoff - 1].votes) cutoff++;
        if (nonzero.length - cutoff === 1) cutoff = nonzero.length;

        const head = nonzero.slice(0, cutoff);
        const tail = nonzero.slice(cutoff);

        const rawSlices = head.map((item, i) => ({ ...item, color: COLORS[i % COLORS.length], isOther: false }));

        if (tail.length > 0) {
            const otherVotes = tail.reduce((sum, x) => sum + x.votes, 0);
            rawSlices.push({
                id: "__other__", displayLabel: `Other (${tail.length})`, votes: otherVotes,
                pctOfPicks: (otherVotes / totalPicks) * 100, pctOfVoters: null,
                color: OTHER_COLOR, isOther: true,
            });
        }

        let angle = -90;
        const cx = 110;
        const cy = 110;
        const r = 98;

        const computedSlices = rawSlices.map((slice) => {
            const sweep = (slice.votes / totalPicks) * 360;
            const startAngle = angle;
            const endAngle = angle + sweep;
            const midAngle = startAngle + sweep / 2;
            angle = endAngle;

            const midRad = (midAngle * Math.PI) / 180;
            const [labelX, labelY] = polarToCartesian(cx, cy, r * 0.64, midAngle);

            return {
                ...slice,
                sweep, path: sweep >= 359.99 ? null : buildSlicePath(cx, cy, r, startAngle, endAngle),
                popX: 5 * Math.cos(midRad), popY: 5 * Math.sin(midRad),
                labelX, labelY,
            };
        });

        return { allItems: sorted, slices: computedSlices };
    }, [category, maxSlices]);

    if (!category || !category.totalPicks) return null;

    const avgPicks = category.answeredCount ? category.totalPicks / category.answeredCount : 0;
    const isMulti = avgPicks > 1.01;
    const hiddenItems = allItems.filter(item => !slices.some((s) => !s.isOther && s.id === item.id));

    return <div style={{ padding: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{title}</h3>
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                {category.answeredCount} respondents
                {isMulti && ` • ${category.totalPicks} votes, ${avgPicks.toFixed(2)} votes per respondent`}
            </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", alignItems: "center" }}>
            <svg viewBox="0 0 220 220" style={{ width: "210px", height: "210px", flexShrink: 0, margin: "0 auto" }}>
                {slices.map((s) => {
                    const isHovered = hoveredId === s.id;
                    const isDimmed = hoveredId !== null && !isHovered;

                    return <g key={s.id}
                        transform={isHovered ? `translate(${s.popX}, ${s.popY})` : undefined}
                        style={{
                            opacity: isDimmed ? 0.45 : 1,
                            transition: "transform 0.15s ease, opacity 0.15s ease",
                            cursor: s.isOther || onItemClick ? "pointer" : "default",
                        }}
                        onMouseEnter={() => setHoveredId(s.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => {
                            if (s.isOther) setShowAll((v) => !v);
                            else if (onItemClick) onItemClick(s);
                        }}
                    >
                        {s.path ?
                            <path d={s.path} fill={s.color} stroke="#111318" strokeWidth={1.5} /> :
                            <circle cx={110} cy={110} r={98} fill={s.color} />
                        }

                        {s.pctOfPicks >= 6 &&
                            <text
                                x={s.labelX} y={s.labelY} textAnchor="middle" dominantBaseline="central"
                                fill="#fff" fontSize="11" fontWeight="bold"
                                style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
                            >
                                {s.pctOfPicks.toFixed(1)}%
                            </text>
                        }
                    </g>;
                })}
            </svg>

            <div style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {slices.map((s) => {
                    const isHovered = hoveredId === s.id;
                    return <div key={s.id}
                        onMouseEnter={() => setHoveredId(s.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => {
                            if (s.isOther) setShowAll((v) => !v);
                            else if (onItemClick) onItemClick(s);
                        }}
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            gap: "0.5rem", padding: "0.25rem 0.45rem", borderRadius: "4px",
                            background: isHovered ? "rgba(255,255,255,0.08)" : "transparent",
                            cursor: s.isOther || onItemClick ? "pointer" : "default",
                            fontSize: "0.8rem",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", minWidth: 0 }}>
                            <span style={{ color: s.color }}>■</span>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {s.isOther ? s.displayLabel : renderLabel(s.id)}
                            </span>
                        </div>

                        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "endn" }}>
                            <span>
                                <span style={{ fontWeight: "bold" }}>{s.votes}</span>
                                {" "}
                                <span style={{ opacity: 0.75 }}>({s.pctOfPicks.toFixed(1)}%)</span>
                            </span>
                            {isMulti && s.pctOfVoters !== null &&
                                <span style={{ opacity: 0.55, fontSize: "0.8rem", marginLeft: "0.35rem" }}>
                                    {s.pctOfVoters.toFixed(0)}% voters
                                </span>
                            }
                        </div>
                    </div>;
                })}
            </div>
        </div>

        {hiddenItems.length > 0 &&
            <div style={{ marginTop: "0.75rem" }}>
                <button type="button" onClick={() => setShowAll((v) => !v)} style={{ fontSize: "0.8rem", cursor: "pointer" }}>
                    {showAll ? "Hide remaining" : `Show remaining ${hiddenItems.length} options`}
                </button>

                {showAll &&
                    <div style={{
                        marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.08)",
                        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "0.3rem 1rem", fontSize: "0.8rem",
                    }}>
                        {hiddenItems.map((item) =>
                            <div key={item.id}
                                onClick={() => onItemClick && onItemClick(item)}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem",
                                    opacity: item.votes === 0 ? 0.45 : 0.9,
                                    cursor: onItemClick ? "pointer" : "default",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", textAlign: "start" }}>
                                    #{item.rank}&nbsp;
                                    {renderLabel(item.id)}
                                </div>
                                <span style={{ flexShrink: 0 }}>
                                    {item.votes} ({item.pctOfPicks.toFixed(1)}%)
                                </span>
                            </div>
                        )}
                    </div>
                }
            </div>
        }
    </div>
}