"use client";

import ChoiceEvent from "../choiceEvent/ChoiceEvent";
import ChoiceEventIcon from "../icons/ChoiceEventIcon";

export default function ChoiceEventModalContent({ choiceEvent }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", maxHeight: "80vh", maxWidth: "800px", overflowY: "auto" }}>
        <span style={{ fontSize: "1.1rem", fontWeight: "bold", textAlign: "center" }}>{choiceEvent.name === "" ? "[Unnamed Event]" : choiceEvent.name}</span>
        <ChoiceEventIcon choiceEvent={choiceEvent} scale={0.5} />
        <ChoiceEvent event={choiceEvent} />
    </div>
}
