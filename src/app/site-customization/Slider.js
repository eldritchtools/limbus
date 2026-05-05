"use client";

import NumberInput from "../components/objects/NumberInput";

export default function Slider({ value, onChange, min = 0, max = 1, step = 0.01 }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <span>Value: </span>
            <NumberInput min={min} max={max} value={value} onChange={onChange} style={{ textAlign: "center", width: "4ch"}} />
        </div>

        <input
            type="range" min={min} max={max} step={step} value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{ width: "100%" }}
        />
    </div>
}