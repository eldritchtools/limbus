"use client";

import Image from "next/image";

import { useData } from "../DataProvider";

import { ASSETS_ROOT } from "@/app/paths";

function rescaleChoiceEvent(scale) {
    return { width: `${Math.round(600 * scale)}px`, height: `${Math.round(400 * scale)}px` };
}

function ChoiceEventIconMain({ id, choiceEvent = null, displayName = false, scale = 1 }) {
    const scaledStyle = rescaleChoiceEvent(scale);
    return <div style={{ ...scaledStyle, position: "relative" }}>
        <Image src={`${ASSETS_ROOT}/choice_events/ChoiceEvent_${id ?? choiceEvent.id}.png`}
            alt={choiceEvent.name} title={choiceEvent.name}
            fill style={{ objectFit: "cover" }}
        />
        {displayName ?
            <div style={{
                position: "absolute", bottom: "4px", left: "50%", transform: "translateX(-50%)", width: "95%", maxHeight: "70%", overflow: "hidden",
                display: "block", textAlign: "center", color: "#ddd", fontWeight: "600", lineHeight: "1.1", textWrap: "balance",
                textShadow: "0 0 4px #000, 0 0 12px #000, 2px 2px 4px #000, -2px -2px 4px #000", fontSize: "1rem"
            }}>
                {choiceEvent.name.length === 0 ? "[Unnamed Event]" : choiceEvent.name}
            </div> :
            null
        }
    </div>
}

function ChoiceEventIconFetch({ id, ...params }) {
    const [choiceEvents, choiceEventsLoading] = useData("md_choice_events");

    if (choiceEventsLoading) {
        return null;
    } else if (!(id in choiceEvents)) {
        console.warn(`Choice Event ${id} not found.`);
        return null;
    } else {
        return <ChoiceEventIconMain id={id} choiceEvent={choiceEvents[id]} {...params} />
    }
}

export default function ChoiceEventIcon({ id, choiceEvent = null, ...params }) {
    if (choiceEvent) {
        return <ChoiceEventIconMain id={id ?? choiceEvent?.id} choiceEvent={choiceEvent} {...params} />
    } else {
        return <ChoiceEventIconFetch id={id} {...params} />
    }
}
