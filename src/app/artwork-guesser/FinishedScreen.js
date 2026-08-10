import React from "react";

import CroppedImage from "./CroppedImage"
import { difficulties } from "./SetupScreen"
import { uiColors } from "../lib/colors"
import { sinnerIdMapping } from "../lib/constants"

const buttonStyle = { fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" };

export default function FinishedScreen({ mode, setMode, settings, quiz, identities, isHost, returnToSetup, scoreboard }) {
    if (mode === "standard") {
        return <>
            <h2>Score: {quiz.score} / {quiz.quiz.problems.length}</h2>
            <span>Difficulty: {difficulties.find(x => x.value === settings.difficulty).label}</span>

            <span className="title-text">Results</span>

            {
                quiz.quiz.problems.map((p, i) =>
                    <span key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <div style={{ color: quiz.results[i] ? uiColors.green : uiColors.red, fontSize: "1.5rem", fontWeight: "bold" }}>
                            {quiz.results[i] ? "✓" : "✕"}
                        </div>
                        [{sinnerIdMapping[identities[p.answer].sinnerId]}] {identities[p.answer].name}
                    </span>
                )
            }

            <div style={{ display: "flex", gap: "1rem" }}>
                <span className="text-link" onClick={() => quiz.start(settings)} style={buttonStyle}>Play Again</span>
                <span className="text-link" onClick={() => quiz.returnToSetup()} style={buttonStyle}>Return to Setup</span>
            </div>
        </>
    } else if (mode === "daily") {
        return <>
            <h2>Overall Score: {quiz.dailyStats.quizzes_correct} / {quiz.dailyStats.quizzes_played}</h2>

            <span className="title-text">Today&apos;s Result</span>
            <h2 style={{ margin: 0, color: quiz.dailyStats.last_completed_correct ? uiColors.green : uiColors.red }}>
                {quiz.dailyStats.last_completed_correct ? "Correct!" : "Incorrect!"}
            </h2>

            <CroppedImage key={quiz?.currentAnswer} problem={quiz?.problem} answer={quiz.currentAnswer} />
            <span>
                Correct answer: [{sinnerIdMapping[identities[quiz.currentAnswer].sinnerId]}] {identities[quiz.currentAnswer].name}
            </span>

            <div style={{ display: "flex", gap: "1rem" }}>
                <span className="text-link" onClick={() => setMode(null)} style={buttonStyle}>Return to Start</span>
            </div>
        </>
    } else if (mode === "multi") {
        return <>
            <h2>Score: {quiz.score} / {quiz.round + 1}</h2>
            <span>Difficulty: {difficulties.find(x => x.value === settings.difficulty).label}</span>

            {mode === "multi" && <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
                    <span className="title-text" style={{ margin: "1rem" }}>Results</span>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(auto, 100px) auto", gap: "0.5rem" }}>
                        <span style={{ fontWeight: "bold" }}>Player</span>
                        <span style={{ fontWeight: "bold" }}>Score</span>
                        {scoreboard.map(({ display_name, score }, i) => <React.Fragment key={i}>
                            <span>{display_name}</span>
                            <span>{score}</span>
                        </React.Fragment>)}
                    </div>
                </div>
            </div>}

            {isHost &&
                <div style={{ display: "flex", gap: "1rem" }}>
                    <span className="text-link" onClick={returnToSetup} style={buttonStyle}>Return to Setup</span>
                </div>
            }
        </>
    }
}