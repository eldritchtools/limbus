"use client";

import React, { useEffect } from "react";

import CroppedImage from "./CroppedImage";
import { difficulties } from "./SetupScreen";
import IdentityImage from "../components/icons/IdentityImage";
import { uiColors } from "../lib/colors";
import { sinnerIdMapping } from "../lib/constants";

function BoxOverlay({ crop }) {
    return <div style={{
        position: "absolute", border: "3px solid #ddd", borderRadius: "6px",
        boxShadow: "0 0 0 2px black, 0 0 20px rgba(255,255,255,.5)", pointerEvents: "none",
        width: `${crop.width * 100}%`, height: `${crop.height * 100}%`,
        left: `${crop.x * 100}%`, top: `${crop.y * 100}%`,
    }} />
}

const buttonStyle = { fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" };

export default function RevealScreen({ mode, settings, quiz, next, endGame, identities, isHost, correctParticipants, scoreboard }) {
    const crop = quiz?.problem?.crop;
    const correct = String(quiz.answers?.[quiz.answers?.length - 1]) === String(quiz.currentAnswer);

    useEffect(() => {
        let handleKeyDown;

        const timeout = setTimeout(() => {
            handleKeyDown = e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if(mode === "multi" && isHost && quiz.round >= settings.rounds - 1 && !settings.infinite) endGame();
                    else next();
                }
            };

            window.addEventListener("keydown", handleKeyDown);
        }, 0);

        return () => {
            clearTimeout(timeout);

            if (handleKeyDown)
                window.removeEventListener("keydown", handleKeyDown);
        };
    }, [next, endGame, mode, isHost, quiz, settings]);

    return <>
        {(mode === "standard" || mode === "multi") ? <>
            <h2 style={{ margin: 0, color: correct ? uiColors.green : uiColors.red }}>
                {correct ? "Correct!" : "Incorrect!"}
            </h2>
            <span>Score: {quiz.score} / {quiz.round + 1}</span>
            <span>Difficulty: {difficulties.find(x => x.value === settings.difficulty).label}</span>
        </> :
            <h2 style={{ margin: 0 }}>Daily Challenge</h2>
        }

        <CroppedImage key={quiz?.currentAnswer} problem={quiz?.problem} answer={quiz.currentAnswer} />
        {quiz.problem.modifier.type !== "none" && <span>Modifier: {quiz.problem.modifier.label}</span>}

        <span>
            Correct answer: [{sinnerIdMapping[identities[quiz.currentAnswer].sinnerId]}] {identities[quiz.currentAnswer].name}
        </span>

        {mode === "multi" ? (
            isHost ? <>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span className="text-link" onClick={next} style={buttonStyle}>
                        {(settings.infinite || quiz.round < settings.rounds - 1) ? "Continue" : "Continue Past Rounds Set"}
                    </span>
                    <span className="text-link" onClick={endGame} style={buttonStyle}>
                        {(settings.infinite || quiz.round >= settings.rounds - 1) ? "End Game" : "End Game Early"}
                    </span>
                </div>
                <span className="sub-text">Press Enter/Space to continue.</span>
            </> :
                <div />
        ) : <>
            <span className="text-link" onClick={next} style={buttonStyle}>Continue</span>
            <span className="sub-text">Press Enter/Space to continue.</span>
        </>
        }

        <span>Guesses:</span>
        {(quiz.answers ?? []).map(x =>
            <span key={x} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <div style={{ color: x === quiz.currentAnswer ? uiColors.green : uiColors.red, fontSize: "1.5rem", fontWeight: "bold" }}>
                    {x === quiz.currentAnswer ? "✓" : "✕"}
                </div>
                [{sinnerIdMapping[identities[x].sinnerId]}] {identities[x].name}
            </span>
        )}

        <div style={{ position: "relative", display: "inline-block" }}>
            <IdentityImage id={quiz.currentAnswer}
                uptie={quiz.problem.uptie}
                style={{ width: "100%", maxWidth: "1000px", height: "auto" }}
            />

            {quiz.problem.modifier?.type === "quad" ? <>
                <BoxOverlay crop={quiz.problem.modifier.crops[0]} />
                <BoxOverlay crop={quiz.problem.modifier.crops[1]} />
                <BoxOverlay crop={quiz.problem.modifier.crops[2]} />
                <BoxOverlay crop={quiz.problem.modifier.crops[3]} />
            </> :
                <BoxOverlay crop={crop} />
            }
        </div>

        {mode === "multi" && <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem" }}>
            <div style={{
                display: "flex", flexDirection: "column", textAlign: "center", width: "300px",
                border: "1px var(--primary-border-color) solid", borderRadius: "0.5rem", padding: "0.5rem"
            }}>
                <span style={{ fontWeight: "bold" }}>Correct Players</span>
                {correctParticipants.map(x => x)}
            </div>
            <div style={{
                display: "flex", flexDirection: "column", textAlign: "center", width: "300px",
                border: "1px var(--primary-border-color) solid", borderRadius: "0.5rem", padding: "0.5rem"
            }}>
                <span style={{ fontWeight: "bold" }}>Scoreboard</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.2rem" }}>
                    <span style={{ fontWeight: "bold" }}>Player</span>
                    <span style={{ fontWeight: "bold" }}>Score</span>
                    {scoreboard.map(({ display_name, score }, i) => <React.Fragment key={i}>
                        <span>{display_name}</span>
                        <span>{score}</span>
                    </React.Fragment>)}
                </div>
            </div>
        </div>}
    </>;
}