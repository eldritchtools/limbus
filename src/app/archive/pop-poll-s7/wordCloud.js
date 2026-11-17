"use client";
import CloudLayout from "d3-cloud";
import React, { useEffect, useMemo, useState } from "react";

const CLOUD_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f472b6", "#38bdf8"];

export default function CommentWordCloud({ wordFrequencies, totalComments }) {
    const [placed, setPlaced] = useState([]);
    const [hovered, setHovered] = useState(null);

    const words = useMemo(() => {
        if (!wordFrequencies) return [];
        const entries = Array.isArray(wordFrequencies)
            ? wordFrequencies.map((w) => [w.text, w.value])
            : Object.entries(wordFrequencies);

        return entries.slice(0, 100).map(([raw, value]) => ({
            text: raw.replace(/_/g, " "),
            value,
        }));
    }, [wordFrequencies]);

    useEffect(() => {
        if (!words.length) return;

        const vals = words.map(w => w.value);
        const minV = Math.min(...vals);
        const maxV = Math.max(...vals);

        const fontSize = (v) => {
            if (maxV === minV) return 26;
            const t = Math.sqrt((v - minV) / (maxV - minV));
            return Math.round(14 + t * 38);
        };

        const layout = new CloudLayout().size([800, 340]).overflow(false);

        const sprites = [...words]
            .sort((a, b) => b.value - a.value)
            .map((word) =>
                layout.getSprite(word.text, {
                    size: fontSize(word.value),
                    datum: word,
                    font: "sans-serif",
                    weight: "bold",
                    padding: 5,
                    rotate: 0,
                })
            )
            .filter(Boolean);

        const nextPlaced = [];
        for (const sprite of sprites) {
            const word = layout.place(sprite);
            if (word) nextPlaced.push(word);
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPlaced(nextPlaced);
    }, [words]);

    if (!words.length) return null;

    return <div style={{width: "100%", maxWidth: "800px", alignSelf: "center"}}>
        <div style={{ display: "flex", justifyContent: "center" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
                {hovered
                    ? `"${hovered.text}" mentioned in ${hovered.datum.value} comments`
                    : `Sized by # of comments • Hover a word for count`}
            </span>
        </div>

        <svg viewBox="0 0 800 340" style={{ width: "100%", height: "auto", display: "block", marginTop: "0.5rem" }}>
            <g transform="translate(400, 170)">
                {placed.map((w, i) => {
                    const isHovered = hovered?.text === w.text;
                    return <text key={w.text}
                        textAnchor="middle"
                        transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                        onMouseEnter={() => setHovered(w)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            fontWeight: "bold", fontSize: `${w.size}px`, fill: CLOUD_COLORS[i % CLOUD_COLORS.length],
                            opacity: hovered && !isHovered ? 0.3 : 1, transition: "opacity 0.15s ease", cursor: "default"
                        }}
                    >
                        {w.text}
                    </text>
                })}
            </g>
        </svg>
    </div>
}