"use client";

import ChoiceEvent from "../choiceEvent/ChoiceEvent";
import { useData } from "../DataProvider";
import ChoiceEventIcon from "../icons/ChoiceEventIcon";

function ChoiceEventModalMain({ choiceEvent }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", maxHeight: "80vh", maxWidth: "800px", overflowY: "auto" }}>
        <span style={{ fontSize: "1.1rem", fontWeight: "bold", textAlign: "center" }}>{choiceEvent.name === "" ? "[Unnamed Event]" : choiceEvent.name}</span>
        <ChoiceEventIcon choiceEvent={choiceEvent} scale={0.5} />
        <ChoiceEvent event={choiceEvent} />
    </div>
}

function ChoiceEventModalLoader({ id }) {
    const [choiceEvents, choiceEventsLoading] = useData("md_choice_events");
    if (choiceEventsLoading || !(id in choiceEvents)) return null;
    return <ChoiceEventModalMain choiceEvent={choiceEvents[id]} />
}

export default function ChoiceEventModalContent({ id, choiceEvent }) {
    if(choiceEvent) return <ChoiceEventModalMain choiceEvent={choiceEvent} />
    return <ChoiceEventModalLoader id={id} />
}