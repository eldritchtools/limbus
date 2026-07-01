"use client";

import React from "react";

export default function PollResultModalContent({ title, result, iconFn, transform }) {
    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", overflowY: "auto" }}>
        <span className="title-text" style={{ textAlign: "center" }}>{title}</span>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "0.5rem", alignItems: "center" }}>
            <span>Place</span>
            <span>Name</span>
            <span>Votes</span>
            {
                result.map((answer, i) => <React.Fragment key={answer.answer}>
                    <span style={{ textAlign: "center" }}>#{i + 1}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        {iconFn && <div style={{flex: 0}}>{iconFn(answer.answer, 32, false)}</div>}
                        <span style={{ whiteSpace: "pre-wrap" }}>{transform ? transform(answer.answer) : answer.answer}</span>
                    </div>
                    <span style={{ textAlign: "center" }}>{answer.count}</span>
                </React.Fragment>)
            }
        </div>
    </div>
}
