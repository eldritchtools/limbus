"use client";

import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";

export default function ColorPicker({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const [local, setLocal] = useState(value);
    const ref = useRef(null);

    useEffect(() => {
        setLocal(value);
    }, [value]);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const isValidHex = x => /^#([0-9A-F]{3}){1,2}$/i.test(x);

    const apply = (color) => {
        setLocal(color);
        onChange(color);
    };

    return (
        <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
            <button onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: "0.2rem", width: "100px" }}>
                <div style={{ width: 16, height: 16, background: value, borderRadius: 4 }} />
                <span style={{ fontFamily: "monospace" }}>{value}</span>
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "110%",
                        left: 0,
                        zIndex: 1000,
                        padding: "0.5rem",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--secondary-border-color)",
                        borderRadius: "0.5rem",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                        width: 200,
                    }}
                >
                    <HexColorPicker color={value} onChange={apply} />

                    <div style={{ display: "flex", gap: "0.2rem", marginTop: "0.5rem" }}>
                        <input
                            value={local}
                            onChange={(e) => {
                                if (isValidHex(e.target.value)) apply(e.target.value);
                                else setLocal(e.target.value);
                            }}
                            style={{ width: "80px", fontFamily: "monospace" }}
                        />

                        <button onClick={() => apply(value)} style={{ flex: 1 }}>
                            Close
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}