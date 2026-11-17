import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Rectangle } from "recharts";

export default function RatingChart({ ratings }) {
    const data = useMemo(() => {
        if (!ratings?.histogram) return [];
        return ratings.histogram.map((entry, idx) => ({ rating: idx, count: entry }))
    }, [ratings]);

    if (!data.length) return null;

    const stats = ratings.all;

    return <ResponsiveContainer width="100%" height={280} minWidth={0}>
        <BarChart data={data} margin={{ top: 24, right: 12, bottom: 4, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--primary-border-color)" opacity={0.35} />
            <XAxis dataKey="rating" tickLine={false}
                axisLine={{ stroke: "var(--primary-border-color)" }}
                tick={{ fill: "var(--primary-text-color)", fontSize: 13 }}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--secondary-text-color)", fontSize: 12 }} />

            <Tooltip
                contentStyle={{
                    backgroundColor: "var(--bg-secondary)", color: "var(--primary-text-color)",
                    border: "1px solid var(--primary-border-color)", borderRadius: "0.6rem"
                }}
                labelStyle={{ color: "var(--primary-text-color)", fontWeight: "bold" }}
                itemStyle={{ color: "var(--primary-text-color)" }}
                cursor={{ fill: "var(--bg-hover)", fillOpacity: 0.35 }}
                labelFormatter={(rating) => `Rating ${rating} / 10`}
                formatter={(value) => {
                    const pct = stats.count > 0 ? ((value / stats.count) * 100).toFixed(1) : "0.0";
                    return [`${value} (${pct}%)`, "Responses"];
                }}
            />
            <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                activeBar={{ fill: "var(--primary-text-color)" }}
                shape={(props) => {
                    const isZero = props.payload?.rating === 0;
                    return <Rectangle {...props}
                        fill={isZero ? "var(--primary-border-color)" : "#3b82f6"}
                        fillOpacity={0.9}
                    />;
                }}
            >
                <LabelList dataKey="count" position="top" formatter={(v) => (v > 0 ? v : "")} fill="var(--primary-text-color)" fontSize={12} />
            </Bar>
        </BarChart>
    </ResponsiveContainer>
}