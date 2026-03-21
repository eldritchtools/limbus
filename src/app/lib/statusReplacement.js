import { useData } from "../components/DataProvider";
import Status from "../components/objects/Status";

function TextWithStatuses({ templateText, includeTooltips = true, iconStyleOverride = {}, nameStyleOverride = {} }) {
    const [statuses, statusesLoading] = useData("statuses");
    const [skillTags, skillTagsLoading] = useData("skill_tags");

    if (!templateText) return null;

    let text = templateText.replaceAll("[[", "[").replaceAll("]]", "]");
    let textPieces = [];
    let index = 0;

    while (true) {
        // Returns ["[variable]", index: number, input: string, groups: undefined]
        let match = text.match(/\[[a-zA-Z0-9_]+\]/);
        if (!match || match.index === undefined) {
            textPieces.push(<span key={index++}>{text}</span>);
            break; // No more variables to replace
        }

        textPieces.push(<span key={index++}>{text.slice(0, match.index)}</span>);
        text = text.slice(match.index + match[0].length);

        let varName = match[0].slice(1, -1);
        if (!statusesLoading && varName in statuses) {
            textPieces.push(<Status key={index++} id={varName} includeTooltip={includeTooltips} iconStyleOverride={iconStyleOverride} nameStyleOverride={nameStyleOverride} />)
        } else if (!skillTagsLoading && varName in skillTags) {
            if ("color" in skillTags[varName]) {
                textPieces.push(<span key={index++} style={{ color: skillTags[varName].color }}>{skillTags[varName].text}</span>)
            } else {
                textPieces.push(<span key={index++}>{skillTags[varName].text}</span>)
            }
        } else {
            textPieces.push(<span key={index++}>[{varName}]</span>);
        }
    }

    return <div style={{ display: "inline" }}>{textPieces}</div>;
}

function replaceStatusesInString(templateText, statuses, skillTags) {
    if (!templateText) return "";
    let text = templateText.replaceAll("[[", "[").replaceAll("]]", "]");
    let textPieces = [];

    while (true) {
        // Returns ["[variable]", index: number, input: string, groups: undefined]
        let match = text.match(/\[[a-zA-Z0-9_]+\]/);
        if (!match || match.index === undefined) {
            textPieces.push(text);
            break; // No more variables to replace
        }

        textPieces.push(text.slice(0, match.index));
        text = text.slice(match.index + match[0].length);

        let varName = match[0].slice(1, -1);
        if (varName in statuses) {
            textPieces.push(statuses[varName].name);
        } else if (varName in skillTags) {
            textPieces.push(skillTags[varName].text);
        } else {
            textPieces.push(`[${varName}]`);
        }
    }

    return textPieces.join("");
}

function ProcessedText({ text, enableTooltips = true, iconStyleOverride = {}, nameStyleOverride = {} }) {
    let str = text.replaceAll("<style=\"highlight\">", "").replaceAll("</style>", "");

    return <TextWithStatuses
        templateText={str} 
        includeTooltips={enableTooltips}
        iconStyleOverride={iconStyleOverride}
        nameStyleOverride={nameStyleOverride}
    />
}

export default ProcessedText;
export { TextWithStatuses, replaceStatusesInString };