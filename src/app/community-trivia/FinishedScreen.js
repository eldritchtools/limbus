import React from "react";

import { uiColors } from "../lib/colors"

const buttonStyle = { fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" };

export default function FinishedScreen({ settings, guesser, onPlayAgain }) {
    return <>
        <h2>Score: {guesser.score} / {guesser.round}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
            <span className="title-text">Results</span>
            {guesser.problems.map((p, i) =>
                <span key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <div style={{ color: guesser.results[i] ? uiColors.green : uiColors.red, fontSize: "1.5rem", fontWeight: "bold" }}>
                        {guesser.results[i] ? "✓" : "✕"}
                    </div>
                    {p.question}
                </span>
            )}
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
            <span className="text-link" onClick={() => {onPlayAgain(); guesser.start(settings)}} style={buttonStyle}>Play Again</span>
            <span className="text-link" onClick={() => guesser.returnToSetup()} style={buttonStyle}>Return to Setup</span>
        </div>
    </>

}