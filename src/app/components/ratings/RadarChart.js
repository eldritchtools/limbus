"use client";

import { InformationCircleIcon } from "@heroicons/react/24/solid";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
} from "recharts";

import { getRatingHelpTooltipProps } from "../tooltips/RatingHelpTooltip";

import { egoCriteria, identityCriteria } from "@/app/lib/ratings";

function buildRadarData(type, globalData, userData) {
    const labels = type === "identity" ? identityCriteria : egoCriteria;
    return Array.from({ length: 5 }, (_, i) => (
        {
            stat: labels[i].label,
            global: globalData ? globalData[i] : 0,
            user: userData ? userData[i] : null,
        }
    ));
}

export default function StatsRadarChart({ type, globalData, userData, includeLabels = true, maxValue = 10, scale = 1 }) {
    const data = buildRadarData(type, globalData, userData);

    return <div style={{ position: "relative" }}>
        {includeLabels &&
            <div {...getRatingHelpTooltipProps(type)} style={{ color: "var(--secondary-text-color)", position: "absolute", top: 5, right: 5, zIndex: 1 }}>
                <InformationCircleIcon width={20 * scale} height={20 * scale} />
            </div>
        }
        <ResponsiveContainer width={(includeLabels ? 325 : 200) * scale} height={200 * scale}>
            <RadarChart data={data}>
                <PolarGrid
                    stroke="var(--secondary-text-color)"
                    strokeOpacity={0.5}
                    gridType="polygon"
                />

                {includeLabels &&
                    <PolarAngleAxis
                        dataKey="stat"
                        tick={{ fill: "var(--secondary-text-color)" }}
                    />
                }

                <PolarRadiusAxis
                    domain={[0, maxValue]}
                    tick={false}
                    axisLine={false}
                    ticks={[2, 4, 6, 8, 10]}
                />

                {globalData &&
                    <Radar
                        name="Community"
                        dataKey="global"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.35}
                        strokeWidth={3}
                        strokeDasharray="5 4"
                        animationDuration={250}
                    />
                }

                {userData &&
                    <Radar
                        name="You"
                        dataKey="user"
                        stroke="#38bdf8"
                        fill="#38bdf8"
                        fillOpacity={0.20}
                        strokeWidth={1}
                        isAnimationActive={true}
                        animationDuration={250}
                        animationEasing="ease-out"
                    />
                }

                {includeLabels &&
                    <Legend />
                }
            </RadarChart>
        </ResponsiveContainer>
    </div>;
}