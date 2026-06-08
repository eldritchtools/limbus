import { useMemo, useRef } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from "recharts";

const COLORS = [
    "#60a5fa", // blue
    "#fbbf24", // amber
    "#34d399", // green
    "#f87171", // red
    "#c084fc", // purple
    "#38bdf8", // cyan
    "#fb7185", // rose
    "#a3e635", // lime
    "#f472b6", // pink
    "#eab308", // yellow
];

export default function ResultsChart({ data, setHoveredPull, compression = 1, calculateMode }) {
    const hoverRef = useRef(null);

    const chartData = useMemo(() => data.map((item) => {
        const obj = { pull: item.pull };
        switch (calculateMode) {
            case "all":
                obj["all"] = Math.min(100, Math.max(0, item.probAll * 100));
                break;
            case "ids":
                item.probIds?.forEach((p, i) => {
                    if (i > 0) obj[`≥${i}`] = Math.min(100, Math.max(0, p * 100));
                });
                break;
            case "egos":
                item.probEgos?.forEach((p, i) => {
                    if (i > 0) obj[`≥${i}`] = Math.min(100, Math.max(0, p * 100));
                });
                break;
            case "announcers":
                item.probAnnouncers?.forEach((p, i) => {
                    if (i > 0) obj[`≥${i}`] = Math.min(100, Math.max(0, p * 100));
                });
                break;
            default:
                break;
        }

        return obj;
    }), [data, calculateMode]);

    const displayedData = useMemo(() => {
        if (!chartData) return [];
        if (compression === 1) return chartData;

        return chartData.filter((_, index) => (index + 1) % compression === 0);
    }, [chartData, compression]);

    const handleHover = (state) => {
        if (!state.isTooltipActive) return;

        const pull = state.activeLabel;

        if (hoverRef.current) cancelAnimationFrame(hoverRef.current);

        hoverRef.current = requestAnimationFrame(() => {
            if (setHoveredPull && pull) setHoveredPull(pull);
            hoverRef.current = null;
        });
    }

    const lineComponents = useMemo(() => {
        if (calculateMode === "all") {
            return [
                <Line
                    key={1}
                    type="monotone"
                    dataKey={`all`}
                    stroke={COLORS[0]}
                    dot={false}
                    strokeWidth={2.5}
                />
            ]
        }

        let count = 1;
        switch (calculateMode) {
            case "ids":
                count = data[0]?.probIds?.length;
                break;
            case "egos":
                count = data[0]?.probEgos?.length;
                break;
            case "announcers":
                count = data[0]?.probAnnouncers?.length;
                break;
        }

        return Array.from({ length: count - 1 }, (_, i) => (
            <Line
                key={i + 1}
                type="monotone"
                dataKey={`≥${i + 1}`}
                stroke={COLORS[i % COLORS.length]}
                dot={false}
                strokeWidth={i === 0 ? 2.5 : 1.5}
            />
        ))
    }, [data, calculateMode]);

    return <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "100%", height: "300px", maxWidth: "1600px", marginBottom: "16px", padding: "0.5rem",
        border: "1px var(--secondary-border-color) solid", borderRadius: "1rem", boxSizing: "border-box"
    }}
    >
        <ResponsiveContainer width="100%" height={300}>
            <LineChart
                data={displayedData}
                onMouseMove={handleHover}
                onTouchMove={handleHover}
            >
                <XAxis dataKey="pull" stroke="var(--primary-text-color)" tick={{ fill: "var(--primary-text-color)" }} />
                <YAxis domain={[0, 100]} stroke="var(--primary-text-color)" tick={{ fill: "var(--primary-text-color)" }} tickFormatter={(v) => `${Math.round(v)}%`} />
                <Legend wrapperStyle={{ color: "var(--primary-text-color)" }} />
                <Tooltip
                    formatter={(value) => value > 99.99995 ? `${(100).toFixed(5)}%` : `${value.toFixed(5)}%`}
                    contentStyle={{
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--primary-border-color)",
                        borderRadius: 4,
                    }}
                    labelStyle={{ color: "var(--primary-text-color)" }}
                    itemStyle={{ color: "var(--primary-text-color)" }}
                    cursor={{ stroke: "var(--disabled-text-color)", strokeWidth: 1 }}
                />
                <CartesianGrid
                    stroke="var(--disabled-text-color)"
                    strokeDasharray="3 3"
                />
                {lineComponents}
            </LineChart>
        </ResponsiveContainer>
    </div>;
}
