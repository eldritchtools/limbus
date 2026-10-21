import { useState } from "react";

import Question from "./Question";

export default function GuessingScreen({ settings, guesser, submitAnswer, skip }) {
    const question = guesser.currentProblem;
    const [answer, setAnswer] = useState("");

    return <>
        <h2 style={{ margin: 0 }}>Round {guesser.round}{settings.infinite ? "" : `/${settings.rounds}`}</h2>
        <span>Score: {guesser.score} / {guesser.round - 1}</span>

        <Question question={question} />

        {
            question.answerType === "short_answer" ? <>
                <input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Input your answer..." />
            </> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", width: "100%", gap: "0.5rem", maxWidth: "1280px" }}>
                {question.options?.map((x, i) => <div key={i}
                    onClick={() => setAnswer(x)}
                    style={{ 
                        padding: "0.5rem",
                        textAlign: "center", border: "1px solid var(--primary-border-color", borderRadius: "1rem",
                        background: answer === x ? "var(--bg-hover)" : null, transition: "0.2s ease background" 
                    }}
                >
                    {x}
                </div>)}
            </div>
        }

        <div style={{ display: "flex", gap: "1rem" }}>
            <span className="text-link" onClick={() => {
                if(!answer || answer.length === 0) return;
                submitAnswer(answer);
            }}
                style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
            >
                Submit Answer
            </span>
            <span className="text-link" onClick={skip}
                style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
            >
                Skip
            </span>
        </div>

        <div style={{ minHeight: "300px" }} />
    </>
}