"use client";

import { useEffect, useState } from "react";

import { useVoicelineQuizGenerator } from "./generator";
import { dailySettings, defaultSettings } from "./settings";
import SetupScreen, { difficulties } from "./SetupScreen";
import VoiceProblem from "./VoiceProblem";
import { useData } from "../components/DataProvider";
import EgoIcon from "../components/icons/EgoIcon";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { useQuiz } from "../components/quiz/useQuiz";
import { EgoDropdownSelector } from "../components/selectors/EgoSelectors";
import { getLocalStore } from "../database/localDB";
import { uiColors } from "../lib/colors";
import { sinnerIdMapping } from "../lib/constants";
import { selectStyleVariable } from "../styles/selectStyle";

const GUESSER_ID = "voiceline";

function Guesser({ mode, setMode }) {
    const [egos, egosLoading] = useData("egos_mini");
    const [settings, setSettings] = useState(mode === "standard" ? defaultSettings : dailySettings);
    const generator = useVoicelineQuizGenerator(settings);
    const quiz = useQuiz(GUESSER_ID, generator);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized && mode !== "daily") {
            const initialize = async () => {
                const saved = await getLocalStore("guessers").get(GUESSER_ID);
                if (saved) setSettings(saved);
                setInitialized(true);
            }

            initialize();
            return;
        }

        if (mode === "daily" && quiz.phase === "setup") quiz.start(settings);
    }, [initialized, mode, quiz, settings]);

    if (!generator || egosLoading) return <LoadingContentPageTemplate />;

    if (quiz.phase === "setup") {
        if (mode === "standard") {
            const handleSetSettings = async (valueOrFn) => {
                const newSettings = typeof valueOrFn === "function" ? valueOrFn(settings) : valueOrFn;
                await getLocalStore("guessers").save({ id: GUESSER_ID, ...newSettings });
                setSettings(newSettings);
            }

            return <SetupScreen
                settings={settings}
                setSettings={handleSetSettings}
                onStart={() => quiz.start(settings)}
                onReset={() => handleSetSettings(defaultSettings)}
            />
        } else
            return <LoadingContentPageTemplate />
    }

    if (quiz.phase === "loading")
        return <LoadingContentPageTemplate />

    if (quiz.phase === "guessing")
        return <>
            {mode === "standard" ? <>
                <h2 style={{ margin: 0 }}>Round {quiz.round + 1}{settings.infinite ? "" : `/${settings.rounds}`}</h2>
                <span>Score: {quiz.score} / {quiz.round}</span>
                <span>Difficulty: {difficulties.find(x => x.value === settings.difficulty).label}</span>
            </> :
                <h2 style={{ margin: 0 }}>Daily Challenge</h2>
            }

            <VoiceProblem key={quiz.problem.answer} problem={quiz.problem} />
            {quiz.problem.modifier.type !== "none" && <span>Modifier: {quiz.problem.modifier.type}</span>}

            <span>Guesses:</span>
            {(quiz.answers ?? []).map(x =>
                <span key={x} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <div style={{ color: uiColors.red, fontSize: "1.5rem", fontWeight: "bold" }}>
                        ✕
                    </div>
                    [{sinnerIdMapping[egos[x].sinnerId]}] {egos[x].name}
                </span>
            )}


            <div style={{ width: "min(100%, 1000px)" }}>
                <EgoDropdownSelector selected={null} setSelected={x => { if (x) quiz.submitGuess(x) }} styles={selectStyleVariable} excludeOptions={quiz.answers ?? []} />
            </div>

            {mode === "standard" &&
                <span className="text-link" onClick={quiz.skip}
                    style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
                >
                    Skip
                </span>
            }

            <div style={{ minHeight: "300px" }} />
        </>

    if (quiz.phase === "reveal") {
        const correct = String(quiz.answers[quiz.answers.length - 1]) === String(quiz.problem.answer);
        return <>
            {mode === "standard" ? <>
                <h2 style={{ margin: 0, color: correct ? uiColors.green : uiColors.red }}>
                    {correct ? "Correct!" : "Incorrect!"}
                </h2>
                <span>Score: {quiz.score} / {quiz.round + 1}</span>
                <span>Difficulty: {difficulties.find(x => x.value === settings.difficulty).label}</span>
            </> :
                <h2 style={{ margin: 0 }}>Daily Challenge</h2>
            }

            <VoiceProblem key={quiz.problem.answer} problem={quiz.problem} showControl={true} />

            <span>
                Correct answer: [{sinnerIdMapping[egos[quiz.problem.answer].sinnerId]}] {egos[quiz.problem.answer].name}
            </span>

            <div style={{ position: "relative", display: "inline-block" }}>
                <EgoIcon id={quiz.problem.answer} type="awaken" size={256} displayName={true} />
            </div>

            <span className="text-link" onClick={quiz.next}
                style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
            >
                Continue
            </span>

            <span>Guesses:</span>
            {(quiz.answers ?? []).map(x =>
                <span key={x} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <div style={{ color: x === quiz.problem.answer ? uiColors.green : uiColors.red, fontSize: "1.5rem", fontWeight: "bold" }}>
                        {x === quiz.problem.answer ? "✓" : "✕"}
                    </div>
                    [{sinnerIdMapping[egos[x].sinnerId]}] {egos[x].name}
                </span>
            )}
        </>;
    }

    if (quiz.phase === "finished")
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
                            [{sinnerIdMapping[egos[p.answer].sinnerId]}] {egos[p.answer].name}
                        </span>
                    )
                }

                <div style={{ display: "flex", gap: "1rem" }}>
                    <span className="text-link" onClick={() => quiz.start(settings)}
                        style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
                    >
                        Play Again
                    </span>
                    <span className="text-link" onClick={() => quiz.returnToSetup()}
                        style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
                    >
                        Return to Setup
                    </span>
                </div>
            </>
        } else if (mode === "daily") {
            return <>
                <h2>Overall Score: {quiz.dailyStats.quizzes_correct} / {quiz.dailyStats.quizzes_played}</h2>

                <span className="title-text">Today&apos;s Result</span>
                <h2 style={{ margin: 0, color: quiz.dailyStats.last_completed_correct ? uiColors.green : uiColors.red }}>
                    {quiz.dailyStats.last_completed_correct ? "Correct!" : "Incorrect!"}
                </h2>

                <VoiceProblem key={quiz?.problem.answer} problem={quiz?.problem} showControl={true} />
                <span>
                    Correct answer: [{sinnerIdMapping[egos[quiz.problem.answer].sinnerId]}] {egos[quiz.problem.answer].name}
                </span>

                <div style={{ position: "relative", display: "inline-block" }}>
                    <EgoIcon id={quiz.problem.answer} type="awaken" size={256} displayName={true} />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <span className="text-link" onClick={() => setMode(null)}
                        style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
                    >
                        Return to Start
                    </span>
                </div>
            </>
        }
}

export default function VoicelineGuesserPage() {
    const [mode, setMode] = useState(null);

    if (!mode)
        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "1000px", gap: "0.5rem" }}>
                <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Voiceline Guesser</h1>
                <span style={{ maxWidth: "1000px", textAlign: "center", marginBottom: "1rem" }}>
                    Guess the E.G.O the voiceline belongs to.
                    <br /> <br />
                    You will hear a clipped segment of one of the voicelines of a random E.G.O. Clips may come from the awakening or corrosion versions, and from any version for base E.G.Os. Try your best to guess which E.G.O it belongs to.
                    <br /> <br />
                    Choose a mode to begin.
                </span>
                <span className="text-link" style={{ fontSize: "1.2rem" }} onClick={() => setMode("standard")}>Standard</span>
                <span className="sub-text">Standard mode lets you guess against a specified number of rounds with customizable settings.</span>
                <span className="text-link" style={{ fontSize: "1.2rem" }} onClick={() => setMode("daily")}>Daily</span>
                <span className="sub-text">Daily mode gives everyone the same problem each day (Reset at 6AM KST). Fixed at normal difficulty and 3 chances.</span>
            </div>
        </div>;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <Guesser mode={mode} setMode={setMode} />
    </div>
}