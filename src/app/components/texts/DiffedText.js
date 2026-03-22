import { diffArrays, diffWords } from "diff";

import { ProcessedText } from "../utils";

const addedStyle = {
    backgroundColor: "rgba(46, 160, 67, 0.35)",
    padding: "0 2px",
    borderRadius: "3px",
    fontWeight: "bold"
}

const removedStyle = {
    backgroundColor: "rgba(248, 81, 73, 0.35)",
    padding: "0 2px",
    borderRadius: "3px",
    textDecoration: "line-through",
    opacity: 0.7,
}

function normalizeForDiff(s) {
  return s
    // bracketed tokens: [foo] → BRACKET_foo_TEKCARB
    .replace(/\[([^\]]+)\]/g, "BRACKET_$1_TEKCARB")
    // bind numeric plus: 5+ → 5PLUSPLUS
    .replace(/(\d)\+/g, "$1PLUSPLUS")
}

function denormaliteForDiff(s) {
    return s
    .replace(/BRACKET_(.*?)_TEKCARB/g, "[$1]")
    .replace(/PLUSPLUS/g, "+")
}

function DiffedTextString({ before, after, iconStyleOverride, nameStyleOverride }) {
    const parts = diffWords(normalizeForDiff(before), normalizeForDiff(after));

    return <span>
        {parts.map((part, i) => {
            const style = part.added ? addedStyle : (part.removed ? removedStyle : null)
            return <span key={i} style={style}>
                <ProcessedText text={denormaliteForDiff(part.value)} iconStyleOverride={iconStyleOverride} nameStyleOverride={nameStyleOverride} />
            </span>
        })}
    </span>
}

function normalizeSnippet(s) {
    return s.replace(/\d+/g, "").trim().toLowerCase();
}

function similarity(a, b) {
    const aWords = normalizeSnippet(a).split(/\s+/);
    const bWords = normalizeSnippet(b).split(/\s+/);
    const common = aWords.filter(word => bWords.includes(word));
    return common.length / Math.max(aWords.length, bWords.length);
}

const SIMILARITY_THRESHOLD = 0.4;

function DiffedTextArray({ before, after, iconStyleOverride, nameStyleOverride }) {
    const snippets = diffArrays(before, after);
    const finalSnippets = [];

    for (let i = 0; i < snippets.length; i++) {
        if (i < snippets.length - 1 && snippets[i].removed && snippets[i + 1].added) {
            const mapping = {};
            const mapped = new Set();

            for (let j = 0; j < snippets[i].count; j++) {
                let bestScore = -1;
                let bestIndex = -1;
                for (let k = 0; k < snippets[i + 1].count; k++) {
                    if (k in mapping) continue;
                    const score = similarity(snippets[i].value[j], snippets[i + 1].value[k]);
                    if (score > bestScore && score > SIMILARITY_THRESHOLD) {
                        bestScore = score;
                        bestIndex = k;
                    }
                }

                if (bestIndex !== -1) {
                    mapping[bestIndex] = j;
                    mapped.add(j);
                }
            }

            for (let j = 0; j < snippets[i].count; j++) {
                if (mapped.has(j)) {
                    continue;
                } else {
                    if (snippets[i].value[j].trim().length === 0) continue;
                    finalSnippets.push(<span key={finalSnippets.length} style={removedStyle}>
                        <ProcessedText text={snippets[i].value[j]} iconStyleOverride={iconStyleOverride} nameStyleOverride={nameStyleOverride} />
                    </span>);
                }
            }

            for (let j = 0; j < snippets[i + 1].count; j++) {
                if (j in mapping) {
                    finalSnippets.push(
                        <DiffedTextString key={finalSnippets.length}
                            before={snippets[i].value[mapping[j]]}
                            after={snippets[i + 1].value[j]}
                            iconStyleOverride={iconStyleOverride}
                            nameStyleOverride={nameStyleOverride}
                        />
                    );
                } else {
                    if (snippets[i + 1].value[j].trim().length === 0) continue;
                    finalSnippets.push(<span key={finalSnippets.length} style={addedStyle}>
                        <ProcessedText text={snippets[i + 1].value[j]} iconStyleOverride={iconStyleOverride} nameStyleOverride={nameStyleOverride} />
                    </span>);
                }
            }

            i++;
            continue;
        }

        const style = snippets[i].added ? addedStyle : (snippets[i].removed ? removedStyle : null);
        for (let j = 0; j < snippets[i].count; j++) {
            if (snippets[i].value[j].trim().length === 0) continue;
            finalSnippets.push(<span key={finalSnippets.length} style={style}>
                <ProcessedText text={snippets[i].value[j]} iconStyleOverride={iconStyleOverride} nameStyleOverride={nameStyleOverride} />
            </span>);
        }
    }

    return <div style={{ display: "flex", flexDirection: "column", whiteSpace: "pre-wrap", gap: "0.1rem" }}>
        {finalSnippets.map((x, i) => <div key={i}>{x}</div>)}
    </div>
}

export default function DiffedText({ before, after, iconStyleOverride, nameStyleOverride }) {
    if (Array.isArray(before))
        return <DiffedTextArray before={before} after={after} iconStyleOverride={iconStyleOverride} nameStyleOverride={nameStyleOverride} />
    return <DiffedTextString before={before} after={after} iconStyleOverride={iconStyleOverride} nameStyleOverride={nameStyleOverride} />
}