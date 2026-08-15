import React from "react";

import { difficulties } from "./SetupScreen";
import VoiceProblem from "./VoiceProblem";
import EgoIcon from "../components/icons/EgoIcon";
import { uiColors } from "../lib/colors";
import { sinnerIdMapping } from "../lib/constants";

const buttonStyle = { fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" };

export default function RevealScreen({ mode, settings, quiz, next, endGame, egos, isHost, correctParticipants, scoreboard }) {
    const correct = String(quiz.answers?.[quiz.answers?.length - 1]) === String(quiz.currentAnswer);

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

        <VoiceProblem key={quiz.currentAnswer} problem={quiz.problem} showControl={true} />
        {quiz.problem.modifier.type !== "none" && <span>Modifier: {quiz.problem.modifier.label}</span>}

        <span>
            Correct answer: [{sinnerIdMapping[egos[quiz.currentAnswer].sinnerId]}] {egos[quiz.currentAnswer].name}
        </span>

        <div style={{ position: "relative", display: "inline-block" }}>
            <EgoIcon id={quiz.currentAnswer} type="awaken" size={256} displayName={true} />
        </div>

        {mode === "multi" ? (
            isHost ? <div style={{ display: "flex", gap: "0.5rem" }}>
                <span className="text-link" onClick={next} style={buttonStyle}>
                    {(settings.infinite || quiz.round < settings.rounds - 1) ? "Continue" : "Continue Past Rounds Set"}
                </span>
                <span className="text-link" onClick={endGame} style={buttonStyle}>
                    {(settings.infinite || quiz.round >= settings.rounds - 1) ? "End Game" : "End Game Early"}
                </span>
            </div> :
                <div />
        ) :
            <span className="text-link" onClick={next} style={buttonStyle}>Continue</span>
        }

        <span>Guesses:</span>
        {(quiz.answers ?? []).map(x =>
            <span key={x} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <div style={{ color: x === quiz.currentAnswer ? uiColors.green : uiColors.red, fontSize: "1.5rem", fontWeight: "bold" }}>
                    {x === quiz.currentAnswer ? "✓" : "✕"}
                </div>
                [{sinnerIdMapping[egos[x].sinnerId]}] {egos[x].name}
            </span>
        )}

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