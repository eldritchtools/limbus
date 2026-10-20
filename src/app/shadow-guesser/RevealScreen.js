"use client";

import React, { useEffect } from "react";

import Problem from "./Problem";
import { additionalInfoLabels, answerToText, checkAnswer, constructLabel } from "./util";
import { uiColors } from "../lib/colors";

const buttonStyle = { fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" };

export default function RevealScreen({ settings, guesser, data, next }) {
    const correct = guesser.results[guesser.results.length - 1];

    useEffect(() => {
        let handleKeyDown;

        const timeout = setTimeout(() => {
            handleKeyDown = e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    next();
                }
            };

            window.addEventListener("keydown", handleKeyDown);
        }, 0);

        return () => {
            clearTimeout(timeout);

            if (handleKeyDown)
                window.removeEventListener("keydown", handleKeyDown);
        };
    }, [next, settings]);

    return <>
        <h2 style={{ margin: 0, color: correct ? uiColors.green : uiColors.red }}>
            {correct ? "Correct!" : "Incorrect!"}
        </h2>
        <span>Score: {guesser.score} / {guesser.round}</span>

        <Problem settings={settings} guesser={guesser} data={data} hidden={false} />
        <span>Additional Info: {additionalInfoLabels[settings.additionalInfo]}</span>

        <span>
            {constructLabel(guesser.currentProblem.category, answerToText(guesser.currentProblem, data))}
        </span>

        <span className="text-link" onClick={next} style={buttonStyle}>Continue</span>
        <span className="sub-text">Press Enter/Space to continue.</span>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
            <span>Guesses:</span>
            {(guesser.answers ?? []).map((x, i) =>
                <span key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <div style={{ color: checkAnswer(x, guesser.currentProblem) ? uiColors.green : uiColors.red, fontSize: "1.5rem", fontWeight: "bold" }}>
                        {checkAnswer(x, guesser.currentProblem) ? "✓" : "✕"}
                    </div>
                    {constructLabel(x.category, answerToText(x, data))}
                </span>
            )}
        </div>
    </>;
}