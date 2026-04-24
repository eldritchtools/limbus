import { useMemo, useState } from "react"

import { fuzzyScore } from "../lib/scoring";

const concerns = [
    {
        concern: "I want to filter ego gifts that trigger based on faction identities or give buffs to identities of a certain faction.",
        answer: "The search bars for gifts include their descriptions when searching. For example, if you want gifts that buff Ring identities, you can type \"Ring\" in the search box."
    },
    {
        concern: "I want a quick way to see passives or to sort by effects for identities or egos.",
        answer: "When creating or viewing a team build, check the display type button to quickly view details like skills or passives. The identities and E.G.Os pages also has a \"Compare Mode\" button. Advanced Compare Mode lets you search/sort through all identities or E.G.Os depending on their various stats and effects. Make sure to change the Display Type if you're using \"Icons Only\"."
    },
    {
        concern: "An encounter I'm looking for isn't in the Encounters page.",
        answer: "I gradually add older encounters to the Encounters page, but it's a mostly manual process, so it takes a while and I may miss some relevant encounters. Feel free to suggest adding it, so I can prioritize it."
    }
]

export default function Concerns() {
    const [searchString, setSearchString] = useState("");

    const results = useMemo(() => {
        if (searchString.length === 0) return [];
        return concerns
            .map(({ concern, answer }) => ({ concern, answer, score: fuzzyScore(searchString, [concern, answer].join(" | ")) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }, [searchString]);

    return <div style={{
        display: "flex", flexDirection: "column", padding: "1rem", gap: "1rem",
        borderRadius: "1rem", border: "1px #777 solid", maxWidth: "min(100%, 800px)",
        boxSizing: "border-box", lineHeight: "1.5", color: "#ddd"
    }}
    >
        <input value={searchString} onChange={e => setSearchString(e.target.value)} placeholder={"Search concern..."} />

        {results.map(({ concern, answer }, i) => <div key={i}>
            <details>
                <summary style={{fontSize: "1.1rem", fontWeight: "bold"}}>{concern}</summary>
                {answer}
            </details>
        </div>)}
    </div>
}