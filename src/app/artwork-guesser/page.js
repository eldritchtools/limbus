"use client";

import { useEffect, useMemo, useState } from "react";

import { useArtworkQuizGenerator } from "./generator";
import PixelatedCrop from "./PixelatedCrop";
import { dailySettings, defaultSettings } from "./settings";
import SetupScreen, { difficulties } from "./SetupScreen";
import { useData } from "../components/DataProvider";
import IdentityImage, { getIdentityArtSrc } from "../components/icons/IdentityImage";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { useQuiz } from "../components/quiz/useQuiz";
import { IdentityDropdownSelector } from "../components/selectors/IdentitySelectors";
import { uiColors } from "../lib/colors";
import { sinnerIdMapping } from "../lib/constants";
import { selectStyleWide } from "../styles/selectStyle";

function Crop({ id, uptie, crop, style = {} }) {
    return <div style={{
        position: "relative", width: crop.width * crop.imgWidth, height: crop.height * crop.imgHeight, overflow: "hidden"
    }}>
        <IdentityImage id={id}
            uptie={uptie}
            style={{
                position: "absolute", userSelect: "none", pointerEvents: "none",
                width: crop.imgWidth, height: crop.imgHeight,
                left: -crop.x * crop.imgWidth, top: -crop.y * crop.imgHeight,
                ...style
            }}
        />
    </div>
}

function CroppedImage({ problem }) {
    if (!problem) return null;

    if (problem.modifier.type === "quad")
        return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px #ddd solid" }}>
            <Crop id={problem.answer} uptie={problem.uptie} crop={problem.modifier.crops[0]} />
            <Crop id={problem.answer} uptie={problem.uptie} crop={problem.modifier.crops[1]} />
            <Crop id={problem.answer} uptie={problem.uptie} crop={problem.modifier.crops[2]} />
            <Crop id={problem.answer} uptie={problem.uptie} crop={problem.modifier.crops[3]} />
        </div>

    if (problem.modifier.type === "grayscale")
        return <div style={{ border: "1px #ddd solid" }}>
            <Crop id={problem.answer} uptie={problem.uptie} crop={problem.crop} style={{ filter: "grayscale(100%)" }} />
        </div>

    if (problem.modifier.type === "blur")
        return <div style={{ border: "1px #ddd solid" }}>
            <Crop id={problem.answer} uptie={problem.uptie} crop={problem.crop} style={{ filter: `blur(${problem.modifier.amount}px)` }} />
        </div>

    if (problem.modifier.type === "invert")
        return <div style={{ border: "1px #ddd solid" }}>
            <Crop id={problem.answer} uptie={problem.uptie} crop={problem.crop} style={{ filter: "invert(1)" }} />
        </div>

    if (problem.modifier.type === "pixelate")
        return <div style={{ border: "1px #ddd solid" }}>
            <PixelatedCrop image={getIdentityArtSrc(problem.answer, problem.uptie)} crop={problem.crop} />
        </div>

    return <div style={{ border: "1px #ddd solid" }}>
        <Crop id={problem.answer} uptie={problem.uptie} crop={problem.crop} />
    </div>
}

function BoxOverlay({ crop }) {
    return <div style={{
        position: "absolute", border: "3px solid #ddd", borderRadius: "6px",
        boxShadow: "0 0 0 2px black, 0 0 20px rgba(255,255,255,.5)", pointerEvents: "none",
        width: `${crop.width * 100}%`, height: `${crop.height * 100}%`,
        left: `${crop.x * 100}%`, top: `${crop.y * 100}%`,
    }} />
}

function Guesser({ mode, setMode }) {
    const [identities, identitiesLoading] = useData("identities_mini");
    const [settings, setSettings] = useState(mode === "standard" ? defaultSettings : dailySettings);
    const generator = useArtworkQuizGenerator(settings);
    const quiz = useQuiz("artwork", generator);
    const crop = quiz?.problem?.crop;

    useEffect(() => {
        if(mode === "daily" && quiz.phase === "setup") quiz.start(settings);
    }, [mode, quiz, settings]);

    if (!generator || identitiesLoading) return <LoadingContentPageTemplate />;

    if (quiz.phase === "setup") {
        if (mode === "standard")
            return <SetupScreen
                settings={settings}
                setSettings={setSettings}
                onStart={() => quiz.start(settings)}
                onReset={() => setSettings(defaultSettings)}
            />
        else
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

            <CroppedImage key={quiz.problem.answer} problem={quiz.problem} />
            {quiz.problem.modifier.type !== "none" && <span>Modifier: {quiz.problem.modifier.type}</span>}

            <span>Guesses:</span>
            {(quiz.answers ?? []).map(x =>
                <span key={x} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <div style={{ color: uiColors.red, fontSize: "1.5rem", fontWeight: "bold" }}>
                        ✕
                    </div>
                    [{sinnerIdMapping[identities[x].sinnerId]}] {identities[x].name}
                </span>
            )}

            <IdentityDropdownSelector selected={null} setSelected={x => quiz.submitGuess(x)} hideIcons={true} styles={selectStyleWide} />

            {mode === "standard" &&
                <span className="text-link" onClick={quiz.skip}
                    style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
                >
                    Skip
                </span>
            }
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

            <CroppedImage key={quiz?.problem.answer} problem={quiz?.problem} />

            <span>
                Correct answer: [{sinnerIdMapping[identities[quiz.problem.answer].sinnerId]}] {identities[quiz.problem.answer].name}
            </span>

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
                    [{sinnerIdMapping[identities[x].sinnerId]}] {identities[x].name}
                </span>
            )}

            <div style={{ position: "relative", display: "inline-block" }}>
                <IdentityImage id={quiz.problem.answer}
                    uptie={quiz.problem.uptie}
                    style={{ width: "100%", maxWidth: "1000px", height: "auto" }}
                />

                {quiz.problem.modifier.type === "quad" ? <>
                    <BoxOverlay crop={quiz.problem.modifier.crops[0]} />
                    <BoxOverlay crop={quiz.problem.modifier.crops[1]} />
                    <BoxOverlay crop={quiz.problem.modifier.crops[2]} />
                    <BoxOverlay crop={quiz.problem.modifier.crops[3]} />
                </> :
                    <BoxOverlay crop={crop} />
                }
            </div>
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
                            [{sinnerIdMapping[identities[p.answer].sinnerId]}] {identities[p.answer].name}
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

                <CroppedImage key={quiz?.problem.answer} problem={quiz?.problem} />
                <span>
                    Correct answer: [{sinnerIdMapping[identities[quiz.problem.answer].sinnerId]}] {identities[quiz.problem.answer].name}
                </span>

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

export default function ArtworkGuesserPage() {
    const [mode, setMode] = useState(null);

    if (!mode)
        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "1000px", gap: "0.5rem" }}>
                <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Artwork Guesser</h1>
                <span style={{ maxWidth: "1000px", textAlign: "center", marginBottom: "1rem" }}>
                    Guess the identity the artwork belongs to.
                    <br /> <br />
                    You will be given a cropped segment of one of the full artworks of a random identity. Try your best to guess which identity it is.
                    <br /> <br />
                    Choose a mode to begin.
                </span>
                <span className="text-link" style={{ fontSize: "1.2rem" }} onClick={() => setMode("standard")}>Standard</span>
                <span className="sub-text">Standard mode lets you guess against a specified number of rounds with customizable settings.</span>
                <span className="text-link" style={{ fontSize: "1.2rem" }} onClick={() => setMode("daily")}>Daily</span>
                <span className="sub-text">Daily mode gives everyone the same problem each day (Reset at 6AM KST). Fixed at Normal difficulty, 3 chances, and uptie art only.</span>
            </div>
        </div>;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <Guesser mode={mode} setMode={setMode} />
    </div>
}