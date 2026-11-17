"use client";

import { useState } from "react";

import ImageHandler from "../icons/ImageHandler";

export default function RoadmapImageModalContent({ images, index }) {
    const [position, setPosition] = useState(index);

    const previous = () => setPosition(p => (p - 1 + images.length) % images.length);
    const next = () => setPosition(p => (p + 1) % images.length);

    return <div style={{
        display: "flex", flexDirection: "column", gap: ".5rem", width: "1600px",
        maxWidth: "90vw", maxHeight: "90vh", padding: "0.2rem", boxSizing: "border-box",
        alignItems: "center"
    }}>
        <div style={{ display: "grid", gridTemplateColumns: "30px minmax(0, 1fr) 30px", alignItems: "center", gap: "0.2rem" }}>
            <button onClick={previous} style={{ margin: "2px", padding: "2px", border: "none", background: "none" }}>◀</button>
            <ImageHandler path={`${images[position]}.webp`} style={{ width: "100%", height: "100%" }} />
            <button onClick={next} style={{ margin: "2px", padding: "2px", border: "none", background: "none" }}>▶</button>
        </div>
        <span className="sub-text">{position + 1} / {images.length}</span>
    </div>;
}