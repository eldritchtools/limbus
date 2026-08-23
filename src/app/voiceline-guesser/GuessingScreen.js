import { difficulties } from "./SetupScreen";
import VoiceProblem from "./VoiceProblem";
import { EgoDropdownSelector } from "../components/selectors/EgoSelectors";
import { uiColors } from "../lib/colors";
import { sinnerIdMapping } from "../lib/constants";
import { selectStyleVariable } from "../styles/selectStyle";

export default function GuessingScreen({ mode, settings, quiz, submitAnswer, endRound, skip, egos, isHost, countStr }) {
    return <>
        {(mode === "standard" || mode === "multi") && <>
            <h2 style={{ margin: 0 }}>Round {quiz.round + 1}{settings.infinite ? "" : `/${settings.rounds}`}</h2>
            <span>Score: {quiz.score} / {quiz.round}</span>
            <span>Difficulty: {difficulties.find(x => x.value === settings.difficulty).label}</span>
        </>}

        {mode === "daily" && <h2 style={{ margin: 0 }}>Daily Challenge</h2>}

        <VoiceProblem key={quiz.problem.answer} problem={quiz.problem} autoPlay={true} />
        {quiz.problem.modifier.type !== "none" && <span>Modifier: {quiz.problem.modifier.label}</span>}

        {(mode === "standard" || mode === "daily") && <>
            <span>Guesses:</span>
            {(quiz.answers ?? []).map(x =>
                <span key={x} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <div style={{ color: uiColors.red, fontSize: "1.5rem", fontWeight: "bold" }}>
                        ✕
                    </div>
                    [{sinnerIdMapping[egos[x].sinnerId]}] {egos[x].name}
                </span>
            )}
        </>}

        {mode === "multi" && <>
            <span>Current Guess:</span>
            {quiz.answers?.length > 0 && <>
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    [{sinnerIdMapping[egos[quiz.answers[0]].sinnerId]}] {egos[quiz.answers[0]].name}
                </span>
                <span className="sub-text">You can change your answer until the host ends the round.</span>
            </>}
        </>}

        <div style={{ width: "min(100%, 1000px)" }}>
            <EgoDropdownSelector 
                selected={null} setSelected={x => { if (x) submitAnswer(x) }} 
                styles={selectStyleVariable} excludeOptions={quiz.answers ?? []} 
                autoFocus={true}
            />
        </div>

        {mode === "standard" &&
            <span className="text-link" onClick={skip}
                style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
            >
                Skip
            </span>
        }

        {mode === "multi" && <span>Answers Submitted: {countStr}</span>}

        {mode === "multi" && isHost && <>
            <span className="text-link" onClick={endRound}
                style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
            >
                End Round
            </span>
            <span className="sub-text">
                End the round when players have locked in their guesses to reveal the answer.
            </span>
        </>}

        <div style={{ minHeight: "300px" }} />
    </>
}