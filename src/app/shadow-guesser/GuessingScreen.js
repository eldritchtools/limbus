import Select from "react-select";

import Problem from "./Problem";
import { additionalInfoLabels, answerToText } from "./util";
import { uiColors } from "../lib/colors";
import { checkFilterMatch } from "../lib/filter";
import { selectStyleVariable } from "../styles/selectStyle";

export default function GuessingScreen({ settings, guesser, data, options, submitAnswer, skip }) {
    return <>
        <h2 style={{ margin: 0 }}>Round {guesser.round}{settings.infinite ? "" : `/${settings.rounds}`}</h2>
        <span>Score: {guesser.score} / {guesser.round - 1}</span>
        <span>Additional Info: {additionalInfoLabels[settings.additionalInfo]}</span>

        <Problem settings={settings} guesser={guesser} data={data} />

        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
            <span>Guesses:</span>
            {(guesser.answers ?? []).map((x, i) =>
                <span key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <div style={{ color: uiColors.red, fontSize: "1.5rem", fontWeight: "bold" }}>
                        ✕
                    </div>
                    {answerToText(x, data)}
                </span>
            )}
        </div>

        <div style={{ width: "min(100%, 1000px)" }}>
            <Select
                value={null} onChange={x => { if (x) submitAnswer(x); }}
                options={options} styles={selectStyleVariable}
                filterOption={(candidate, input) => checkFilterMatch(input, candidate.data.searchStrings)}
                placeholder={"Search options..."} autoFocus={true}
            />
        </div>

        <span className="text-link" onClick={skip}
            style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
        >
            Skip
        </span>

        <div style={{ minHeight: "300px" }} />
    </>
}