"use client";

import ChoiceEventIcon from "../icons/ChoiceEventIcon";
import KeywordIcon from "../icons/KeywordIcon";
import MarkdownRenderer from "../markdown/MarkdownRenderer";

import { affinityColorMapping, uiColors } from "@/app/lib/colors";
import { affinities, sinnerIdMapping } from "@/app/lib/constants";

function cardStyle(borderColor) {
    return {
        display: "flex",
        flexDirection: "column",
        borderLeft: `2px ${borderColor} solid`,
        gap: "0.5rem",
        width: "100%",
        borderRadius: "0.5rem",
        boxSizing: "border-box",
        padding: "0.15rem"
    }
}

function constructTarget(target) {
    const pieces = [];
    let singular = true;
    if (target.target === "all") {
        pieces.push("Allies");
        singular = false;
    } else if (target.target === "random") {
        if (target.num === 1) pieces.push("Random ally");
        else {
            pieces.push(`${target.num} random allies`);
            singular = false;
        }
    } else if (target.target === "lowestHp") {
        if (target.num === 1) pieces.push("Lowest HP ally");
        else {
            pieces.push(`${target.num} lowest HP allies`);
            singular = false;
        }
    } else if (target.target === "lowestSp") {
        if (target.num === 1) pieces.push("Lowest SP ally");
        else {
            pieces.push(`${target.num} lowest SP allies`);
            singular = false;
        }
    } else if (target.target === "chosen") {
        return { component: <span>Selected ally</span>, singular: true }
    } else if (target.target === "notChosen") {
        return { component: <span>All other allies</span>, singular: false }
    } else if (target.target === "sinner") {
        return { component: <span>{sinnerIdMapping[target.sinnerId]}</span>, singular: true }
    }

    if (target.condition) {
        if (target.condition.type === "withAffinity" || target.condition.type === "withoutAffinity") {
            pieces.push(` ${target.condition.type.slice(0, -8)} `);

            const affinityPiece = affinity =>
                <span style={{
                    color: affinityColorMapping[affinity], verticalAlign: "middle",
                    display: "inline-flex", alignItems: "center", transform: "translateY(-0.05rem)"
                }}>
                    <KeywordIcon id={affinity} style={{ transform: "translateY(-0.1rem)" }} />{affinity}
                </span>;

            pieces.push(affinityPiece(target.condition.affinity[0]));
            if (target.condition.length === 2) {
                pieces.push(" or ");
                pieces.push(affinityPiece(target.condition.affinity[1]));
            } else if (target.condition.length > 2) {
                for (let i = 1; i < target.condition.length; i++) {
                    if (i === target.condition.length - 1) pieces.push(", or ");
                    else pieces.push(", ");
                    pieces.push(affinityPiece(target.condition.affinity[i]));
                }
            }
            pieces.push(" skills");
        }
    }

    return { component: <span>{pieces.map((piece, i) => <span key={i}>{piece}</span>)}</span>, singular: singular };
}

function constructTargetedString(target, singularAction, pluralAction, value) {
    const { component, singular } = constructTarget(target);
    if (singular) return <span>{component} {singularAction} {value}</span>
    else return <span>{component} {pluralAction} {value}</span>
}

function SingleResult({ result }) {
    if (result.type === "getEgoGift")
        return <MarkdownRenderer content={`Get {giftname:${result.id}}.`} />
    if (result.type === "getEgoGiftOnWin")
        return <MarkdownRenderer content={`Get {giftname:${result.id}} on win.`} />
    if (result.type === "abnoBattle")
        return <span style={{ color: uiColors.red }}>Combat Encounter: {result.label}</span>
    if (result.type === "healHp")
        return constructTargetedString(result.target, "heals", "heal", `${result.value} HP.`)
    if (result.type === "healHpFull")
        return constructTargetedString(result.target, "heals", "heal", `to full HP.`)
    if (result.type === "healSp")
        return constructTargetedString(result.target, "heals", "heal", `${result.value} SP.`)
    if (result.type === "healSpFull")
        return constructTargetedString(result.target, "heals", "heal", `to full SP.`)
    if (result.type === "healHpSp")
        return constructTargetedString(result.target, "heals", "heal", `${result.hpValue} HP and ${result.spValue} SP.`)
    if (result.type === "loseHp")
        return constructTargetedString(result.target, "loses", "lose", `${result.value} HP.`)
    if (result.type === "loseHpPercent")
        return constructTargetedString(result.target, "loses", "lose", `${result.value}% HP.`)
    if (result.type === "loseSp")
        return constructTargetedString(result.target, "loses", "lose", `${result.value} SP.`)
    if (result.type === "loseHpSp")
        return constructTargetedString(result.target, "loses", "lose", `${result.hpValue} HP and ${result.spValue} SP.`)
    if (result.type === "gainCost")
        return <span>Gain {result.value} Cost.</span>
    if (result.type === "loseCost")
        return <span>Lose {result.value} Cost.</span>
    if (result.type === "special")
        return <span>{result.text}</span>

    return null;
}

function Result({ result, successCondition = false, failureCondition = false }) {
    return <div style={cardStyle("#444")}>
        {successCondition ?
            <span style={{ color: uiColors.green, fontWeight: "bold" }}>Success</span> :
            null
        }
        {failureCondition ?
            <span style={{ color: uiColors.red, fontWeight: "bold" }}>Failure</span> :
            null
        }
        {result.condition !== "None" ?
            <span style={{ fontSize: "0.9rem", color: "#aaa" }}>{result.condition}</span> :
            null
        }
        {result.results?.map((res, i) => <SingleResult key={i} result={res} />)}
        {!result.results && !result.nextEvent ?
            <span style={{ color: "#aaa" }}>Nothing happened.</span> :
            null
        }
        {result.nextEvent ?
            <Event event={result.nextEvent} /> :
            null
        }
    </div>;
}

function LockCondition({ condition }) {
    if (condition.type === "gift")
        return <MarkdownRenderer content={`Requires {giftname:${condition.id}}`} />
    if (condition.type === "gifts") {
        const pieces = [];
        const pushGift = id => pieces.push(`{giftname:${id}}`)
        pushGift(condition.ids[0])
        if (condition.ids.length === 2) {
            pieces.push(" or ");
            pushGift(condition.ids[1]);
        } else if (condition.ids.length > 2) {
            for (let i = 1; i < condition.ids.length; i++) {
                if (i === condition.ids.length - 1) pieces.push(", or ");
                else pieces.push(", ");
                pushGift(condition.ids[i]);
            }
        }
        return <MarkdownRenderer content={`Requires at least ${condition.num} from ${pieces.join("")}`} />
    }
    if (condition.type === "cost")
        return `Requires at least ${condition.value} cost`

    return null;
}

function processMessage(message) {
    let i = 0;

    function parse() {
        const nodes = [];

        while (i < message.length) {
            if (message[i] === "<" && message[i + 1] === "/") return nodes;

            if (message[i] === "<") {
                const end = message.indexOf(">", i);
                const tagContent = message.slice(i + 1, end);

                const [tag, value] = tagContent.split("=");
                i = end + 1;

                const children = parse();
                const closeEnd = message.indexOf(">", i);
                i = closeEnd + 1;

                let style = {};
                if (tag === "size") style.fontSize = value;
                if (tag === "color") style.color = value;

                nodes.push(<span style={style} key={i}>{children}</span>);
                continue;
            }

            let nextTag = message.indexOf("<", i);
            if (nextTag === -1) nextTag = message.length;

            nodes.push(message.slice(i, nextTag));
            i = nextTag;
        }

        return nodes;
    }

    return parse();
}

function Option({ option }) {
    return <div style={cardStyle("#777")}>
        {option.lockCondition ? <span style={{ fontSize: "0.8rem", color: "#aaa" }}><LockCondition condition={option.lockCondition} /></span> : null}
        <span>{processMessage(option.message)}</span>
        {option.messageDesc ? <span style={{ fontSize: "0.9rem", color: "#aaa" }}>{option.messageDesc}</span> : null}
        <div style={{ display: "flex", flexDirection: "column", paddingLeft: "1.5rem" }}>
            {option.result?.map((result, i) => <Result key={i} result={result} />)}
        </div>
    </div>
}

function RollBonusTarget({target}) {
    if(target.type === "identity")
        return <MarkdownRenderer content={target.ids.map(id => `{id:${id}}`).join(", ")} />
    if(target.type === "sinner")
        return sinnerIdMapping[target.sinnerId]
    if(target.type === "tag")
        return `${target.tags.join(", ")} identities`

    return null;
}

function Event({ event }) {
    if (event.type === "Choice")
        return <div style={{ ...cardStyle("transparent") }}>
            {event.options.map((option, i) => <Option key={i} option={option} />)}
        </div>
    if (event.type === "Roll")
        return <div style={cardStyle("#aaa")}>
            <div style={{ display: "flex", alignItems: "center", fontWeight: "bold" }}>
                {event.advantageAffinities.map(x => <KeywordIcon key={x} id={x} />)}
                {event.rollType === "min" ? "≥ " : "≤ "}
                {event.advantageValue}
            </div>
            <div style={{ display: "flex", alignItems: "center", fontWeight: "bold" }}>
                {affinities.filter(x => !event.advantageAffinities.includes(x)).map(x => <KeywordIcon key={x} id={x} />)}
                {event.rollType === "min" ? "≥ " : "≤ "}
                {event.value}
            </div>
            {event.bonuses ?
                <div style={{display: "flex", flexDirection: "column", gap: "0.1rem"}}>
                    {event.bonuses.map((bonus, i) => 
                        <span key={i} style={{ display: "inline-flex", fontSize: "0.8rem", color: "#aaa" }}>
                            {bonus.value > 0 ? `+${bonus.value}` : bonus.value}:&nbsp;<RollBonusTarget target={bonus.target} />
                        </span>
                    )}
                </div> :
                null
            }
            <div style={{ display: "flex", flexDirection: "column", paddingLeft: "1.5rem" }}>
                {event.successResults.map((res, i) => <Result key={`s-${i}`} result={res} successCondition={true} />)}
                {event.failureResults.map((res, i) => <Result key={`f-${i}`} result={res} failureCondition={true} />)}
            </div>
        </div>
    if (event.type === "Repeat")
        return <span>Repeat previous option.</span>;
}

export default function ChoiceEventModalContent({ choiceEvent }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", maxHeight: "80vh", maxWidth: "800px", overflowY: "auto" }}>
        <span style={{ fontSize: "1.1rem", fontWeight: "bold", textAlign: "center" }}>{choiceEvent.name === "" ? "[Unnamed Event]" : choiceEvent.name}</span>
        <ChoiceEventIcon choiceEvent={choiceEvent} scale={0.5} />
        <Event event={choiceEvent} />
    </div>
}
