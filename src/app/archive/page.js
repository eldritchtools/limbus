"use client";

import React from "react";

import NoPrefetchLink from "../components/NoPrefetchLink";

const pages = [
    {
        date: "2026-05-26",
        label: "Direction of Limbus Company Tools Survey",
        href: "survey-2026-05-26"
    },
    {
        date: "2026-07-01",
        label: "Absolute Pride Resonance 2026",
        href: "apr-2026"
    }
]

export default function ArchivePage() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "column", width: "100%", alignItems: "start" }}>
        <h3>Archive</h3>
        <span className="sub-text">
            Archive of past events
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", width: "100%", gap: ".2rem", marginTop: "0.5rem" }}>
            {pages.map((page, i) => <React.Fragment key={i}>
                <span className="sub-text">{page.date}</span>
                <NoPrefetchLink 
                    className="text-link" href={`archive/${page.href}`}
                    style={{ marginLeft: "0.3rem", textAlign: "start", fontWeight: "normal" }}
                >
                    {page.label}
                </NoPrefetchLink>
            </React.Fragment>)}
        </div>
    </div>
}