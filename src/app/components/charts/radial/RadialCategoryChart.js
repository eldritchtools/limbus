import { useEffect, useMemo, useRef, useState } from "react";

import { calculateChartGeometry, describeSector, shadeColor, } from "./radialUtils";
import KeywordIcon from "../../icons/KeywordIcon";
import { getDistributionTooltipProps } from "../../tooltips/DistributionTooltip";

export default function RadialCategoryChart({
    width = 240, height = 240, categories, max,
    padding = 20, gap = 4, innerRadius = 0,
    iconOffset = 14, threshold,
    tooltipId, onCategoryHover
}) {
    const [hovered, setHovered] = useState(null);
    const geometry = useMemo(() => {
        return calculateChartGeometry({
            width, height, categories, max,
            padding, gap, innerRadius, iconOffset,
        });
    }, [
        width, height, categories, max,
        padding, gap, innerRadius, iconOffset,
    ]);

    const thresholdRadius = threshold == null ? null :
        geometry.innerRadius + (threshold / geometry.max) * (geometry.outerRadius - geometry.innerRadius);

    return <div style={{ position: "relative", width, height }}>
        <svg width={width} height={height}>
            <circle
                cx={geometry.cx} cy={geometry.cy} r={geometry.outerRadius}
                fill="none" stroke="rgba(255,255,255,.15)" strokeWidth={1}
            />

            {Array.from(({ length: 4 }), (_, i) =>
                <circle key={i}
                    cx={geometry.cx} cy={geometry.cy} r={geometry.outerRadius * (i / 4)}
                    fill="none" stroke="rgba(255,255,255,.15)" strokeWidth={1}
                />)
            }

            {geometry.categories.map((g, i) => {
                const colors = {
                    active: g.category.color,
                    backup: shadeColor(g.category.color, 0.5),
                    inactive: shadeColor(g.category.color, 0.75),
                };
                const opacity = hovered == null ? .8 : (hovered === g.id ? 1 : 0.35);

                return <g key={g.id}>
                    {g.bands.map(band => {
                        if (band.key === "inactive") return;

                        return <path
                            key={band.key}
                            d={describeSector(geometry.cx, geometry.cy, band.innerRadius, band.outerRadius, g.startAngle, g.endAngle,)}
                            fill={colors[band.key]}
                            opacity={opacity}
                        />
                    })}

                    <path
                        d={describeSector(geometry.cx, geometry.cy, geometry.innerRadius, geometry.outerRadius, g.startAngle, g.endAngle)}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => { setHovered(g.id); onCategoryHover?.(g.category); }}
                        onMouseLeave={() => { setHovered(null); onCategoryHover?.(null); }}
                        {...getDistributionTooltipProps(categories[i].id, categories[i].active, categories[i].backup, categories[i].inactive)}

                        fill="transparent"
                        opacity={opacity}
                        stroke="rgba(255,255,255,.08)"
                        strokeWidth={0.75}
                        strokeLinejoin="round"
                    />
                </g>
            })}

            {thresholdRadius != null && max >= threshold &&
                <circle
                    cx={geometry.cx} cy={geometry.cy} r={thresholdRadius}
                    fill="none" stroke="rgba(255,255,0,.7)" strokeWidth={2}
                />
            }
        </svg>

        {geometry.categories.map((g, i) => (
            <div key={g.id}
                style={{
                    position: "absolute", left: g.iconX, top: g.iconY,
                    opacity: hovered == null ? 1 : (hovered === g.id ? 1 : .35),
                    transition: "opacity .15s ease",
                    transform: hovered === g.id ? "translate(-50%, -50%) scale(1.08)" : "translate(-50%, -50%)"
                }}
                onMouseEnter={() => { setHovered(g.id); onCategoryHover?.(g.category); }}
                onMouseLeave={() => { setHovered(null); onCategoryHover?.(null); }}
                {...getDistributionTooltipProps(categories[i].id, categories[i].active, categories[i].backup, categories[i].inactive)}
            >
                <KeywordIcon id={g.category.id} size={24} />
            </div>
        ))}
    </div>
}