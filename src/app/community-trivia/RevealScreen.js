"use client";

import { FlagIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";

import Question from "./Question";
import { checkAnswer, TRIVIA_REPORT_REASONS } from "./util";
import MarkdownRenderer from "../components/markdown/MarkdownRenderer";
import { submitTriviaReport } from "../database/trivia";
import { uiColors } from "../lib/colors";

const buttonStyle = { fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" };

export default function RevealScreen({ guesser, next }) {
    const [reporting, setReporting] = useState(false);
    const [reason, setReason] = useState("incorrect_answer");
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const correct = guesser.results[guesser.results.length - 1];

    useEffect(() => {
        if (reporting) return;

        const handleKeyDown = e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                next();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [next, reporting]);

    const submitReport = async () => {
        setLoading(true);
        await submitTriviaReport({ questionId: guesser.currentProblem.id, reason, details });
        setMessage("Thanks for submitting!");
        setReporting(false);
        setDetails("");
        setLoading(false);
    }

    return <>
        <h2 style={{ margin: 0, color: correct ? uiColors.green : uiColors.red }}>
            {correct ? "Correct!" : "Incorrect!"}
        </h2>
        <span>Score: {guesser.score} / {guesser.round}</span>

        <Question question={guesser.currentProblem} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", maxWidth: "1280px" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Answer</span>
            {guesser.currentProblem.answer}
            {guesser.currentProblem.answerType === "short_answer" && guesser.currentProblem.otherAnswers.length > 0 && <>
                <span>Alternative answers:</span>
                {guesser.currentProblem.otherAnswers.map((x, i) => <span key={i}>{x}</span>)}
            </>}
            {guesser.currentProblem.explanation?.length > 0 &&
                <MarkdownRenderer content={guesser.currentProblem.explanation} />
            }
        </div>

        <span className="text-link" onClick={next} style={buttonStyle}>Continue</span>
        <span className="sub-text">Press Enter/Space to continue. (Disabled when reporting)</span>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
            {(guesser.answers ?? []).map((x, i) =>
                <span key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <div style={{ color: checkAnswer(x, guesser.currentProblem) ? uiColors.green : uiColors.red, fontSize: "1.5rem", fontWeight: "bold" }}>
                        {checkAnswer(x, guesser.currentProblem) ? "✓" : "✕"}
                    </div>
                    {x}
                </span>
            )}
        </div>

        <button onClick={() => { setReporting(p => !p); setMessage(""); }} style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <FlagIcon style={{ width: "24px", height: "24px" }} /> Report Question
        </button>

        {reporting && <>
            <select value={reason} onChange={e => setReason(e.target.value)}>
                {Object.entries(TRIVIA_REPORT_REASONS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>

            <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={5}
                cols={40}
                placeholder="What's wrong with this question?"
            />

            <button onClick={submitReport} disabled={loading}>
                Submit Report
            </button>
        </>}

        <span>{message}</span>
    </>;
}