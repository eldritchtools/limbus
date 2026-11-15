import React, { useEffect, useMemo, useRef, useState } from "react";

const LABELS = {
    1: { long: "Canto I: The Outcast", short: "Canto I" },
    2: { long: "Canto II: The Unloving", short: "Canto II" },
    3: { long: "Canto III: The Unconfronting", short: "Canto III" },
    4: { long: "Canto IV: The Unchanging", short: "Canto IV" },
    5: { long: "Canto V: The Evil Defining", short: "Canto V" },
    6: { long: "Canto VI: The Heartbreaking", short: "Canto VI" },
    7: { long: "Canto VII: The Dream Ending", short: "Canto VII" },
    8: { long: "Canto VIII: The Surrendered Witnessing", short: "Canto VIII" },
    9: { long: "Canto IX: The Unsevering", short: "Canto IX" }
}

function getLong(short) {
    return Object.values(LABELS).find(label => label.short === short).long;
}

export default function ComparisonChart({ cantoComparison }) {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(([entry]) => {
            setWidth(entry.contentRect.width);
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const MARGIN = width < 500 ? 24 : 44;

    const LEVEL_HEIGHT = 24;
    const LABEL_OFFSET = 10;
    const CHAR_WIDTH = 9;
    const LABEL_PADDING = 10;
    const EXTRA_GAP = 12;

    const { layout, maxLevel } = useMemo(() => {
        if (!width || !cantoComparison?.headToHead) {
            return { layout: [], maxLevel: 1 };
        }

        const levelOffset = level => {
            if (level === 0) return 0;

            const n = Math.ceil(level / 2);
            return level % 2 ? -n : n;
        };

        const items = cantoComparison.headToHead.map(item => {
            const tie = item.tie ?? item.tieActive ?? 0;
            const total = item.ixBetter + tie + item.ixWorse;
            const score = total > 0 ? (item.ixWorse - item.ixBetter) / total : 0;
            const roman = item.short.replace(/^Canto\s+/i, "");

            return {
                short: item.short, label: getLong(item.short), shortLabel: roman,
                score, total,
                ixBetter: item.ixBetter, tie, ixWorse: item.ixWorse,
                x: MARGIN + ((score + 1) / 2) * (width - MARGIN * 2),
                labelWidth: roman.length * CHAR_WIDTH + LABEL_PADDING,
            };
        });

        items.push({
            short: "Canto IX", label: LABELS[9].long, shortLabel: "IX",
            score: 0, isRef: true,
            x: MARGIN + 0.5 * (width - MARGIN * 2),
            labelWidth: 2 * CHAR_WIDTH + LABEL_PADDING,
        });

        const sorted = items.sort((a, b) => a.x - b.x);
        const levels = [];
        let highestLevel = 0;

        const placed = sorted.map((point) => {
            let level = 0;
            while (true) {
                const previous = levels[level];
                if (!previous) break;
                const previousRight = previous.x + LABEL_OFFSET + previous.labelWidth;
                if (point.x > previousRight + EXTRA_GAP) break;
                level++;
            }
            levels[level] = point;
            highestLevel = Math.max(highestLevel, Math.abs(levelOffset(level)));
            return { ...point, levelOffset: levelOffset(level) };
        });

        return { layout: placed, maxLevel: highestLevel };
    }, [cantoComparison, MARGIN, width]);

    const axisY = (maxLevel + 1) * LEVEL_HEIGHT + 16;
    const height = axisY + (maxLevel + 1) * LEVEL_HEIGHT + 36;

    const getColor = (point) => {
        if (point.isRef) return "var(--primary-text-color)";
        if (point.score < -0.02) return "#10b981";
        if (point.score > 0.02) return "#f59e0b";
        return "#9ca3af";
    };

    return <div ref={containerRef} style={{ width: "100%" }}>
        {width > 0 &&
            <svg width="100%" height={height} style={{ display: "block", overflow: "visible" }}>
                <line
                    x1={width / 2} x2={width / 2} y1={12} y2={height - 28}
                    stroke="var(--primary-border-color)" strokeDasharray="4 4" opacity={0.55}
                />

                <line x1={MARGIN} x2={width - MARGIN} y1={axisY} y2={axisY} stroke="var(--primary-border-color)" />

                {[-1, -0.5, 0, 0.5, 1].map(value => {
                    const x = MARGIN + ((value + 1) / 2) * (width - MARGIN * 2);
                    return <line key={value} x1={x} x2={x} y1={axisY - 5} y2={axisY + 5} stroke="var(--primary-border-color)" />;
                })}

                {layout.map(point => {
                    const y = axisY + point.levelOffset * LEVEL_HEIGHT;
                    const isHovered = hovered?.short === point.short;
                    const isDimmed = hovered !== null && !isHovered && !point.isRef;
                    const color = getColor(point);

                    return <g key={point.short}
                        onMouseEnter={() => !point.isRef && setHovered(point)}
                        onMouseLeave={() => !point.isRef && setHovered(null)}
                        onClick={() =>
                            !point.isRef &&
                            setHovered((h) => (h?.short === point.short ? null : point))
                        }
                        style={{
                            opacity: isDimmed ? 0.35 : 1,
                            transition: "opacity 0.15s ease",
                            cursor: point.isRef ? "default" : "pointer",
                        }}
                    >
                        <rect x={point.x - 10} y={y - 12} width={16 + point.labelWidth} height={24} fill="transparent" />

                        {point.isRef ?
                            <circle cx={point.x} cy={y} r={isHovered ? 6 : 4.5} fill={color} /> :
                            <>
                                {isHovered &&
                                    <circle cx={point.x} cy={y} r={9} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6} />
                                }
                                <circle cx={point.x} cy={y} r={isHovered ? 6 : 4.5} fill={color} />
                            </>
                        }

                        <text
                            x={point.x + LABEL_OFFSET} y={y + 5} fontSize="1.05rem"
                            fontWeight={isHovered || point.isRef ? "bold" : "normal"}
                            fill={point.isRef ? "var(--primary-text-color)" : color}
                        >
                            {point.shortLabel}
                        </text>
                    </g>
                })}

                <text x={MARGIN} y={height - 6} fontSize="0.8rem" fill="var(--primary-text-color)" opacity={0.75}>
                    ← Prefer Canto IX
                </text>

                <text
                    x={width / 2} y={height - 6} textAnchor="middle" fontSize="0.8rem"
                    fill="var(--primary-text-color)" opacity={0.75}
                >
                    Even (0)
                </text>

                <text
                    x={width - MARGIN} y={height - 6} textAnchor="end" fontSize="0.8rem"
                    fill="var(--primary-text-color)" opacity={0.75}
                >
                    Prefer Previous →
                </text>
            </svg>
        }

        <div style={{
            minHeight: "4rem", display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
            {hovered ? (() => {
                const bPct = (hovered.ixBetter / hovered.total) * 100;
                const tPct = (hovered.tie / hovered.total) * 100;
                const wPct = (hovered.ixWorse / hovered.total) * 100;

                return <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.9rem" }}>
                        <strong>{hovered.label}</strong>
                        <span style={{ opacity: 0.85 }}>
                            Avg Score: <strong>{hovered.score >= 0 ? `+${hovered.score.toFixed(2)}` : hovered.score.toFixed(2)}</strong>
                        </span>
                    </div>

                    {/* Mini 3-color split bar */}
                    <div style={{ display: "flex", height: "0.75rem", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${bPct}%`, background: "#10b981" }} />
                        <div style={{ width: `${tPct}%`, background: "#4b5563" }} />
                        <div style={{ width: `${wPct}%`, background: "#f59e0b" }} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.8rem", opacity: 0.85 }}>
                        <span><span style={{ color: "#10b981" }}>■</span> Prefer Canto IX: {hovered.ixBetter} ({bPct.toFixed(1)}%)</span>
                        <span><span style={{ color: "#9ca3af" }}>■</span> Tie: {hovered.tie} ({tPct.toFixed(1)}%)</span>
                        <span><span style={{ color: "#f59e0b" }}>■</span> Prefer {hovered.short}: {hovered.ixWorse} ({wPct.toFixed(1)}%)</span>
                    </div>
                </div>;
            })() :
                <div style={{ textAlign: "center", fontSize: "0.85rem", opacity: 0.65 }}>
                    Hover or tap a Canto to see its Better / Tie / Worse breakdown.
                </div>
            }
        </div>
    </div>;
}