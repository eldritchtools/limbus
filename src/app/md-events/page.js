"use client";

import { useMemo, useState } from "react";

import styles from "./mdEvents.module.css";
import { useData } from "../components/DataProvider";
import HoverBlocker from "../components/HoverBlocker";
import ChoiceEventIcon from "../components/icons/ChoiceEventIcon";
import KeywordIcon from "../components/icons/KeywordIcon";
import { useModal } from "../components/modals/ModalProvider";
import Gift from "../components/objects/Gift";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { affinities } from "../lib/constants";
import { checkFilterMatch } from "../lib/filter";
import useLocalState from "../lib/useLocalState";

function ChoiceEventCard({ choiceEvent }) {
    const { openChoiceEventModal } = useModal();
    const [blockHover, setBlockHover] = useState(false);

    return <div
        className={`${styles.choiceEventCard} ${!blockHover ? styles.canHover : null}`}
        onClick={() => { if (!blockHover) openChoiceEventModal({ choiceEvent }) }}
    >
        <span style={{ fontSize: "1.1rem", fontWeight: "bold", textAlign: "center" }}>{choiceEvent.name === "" ? "[Unnamed Event]" : choiceEvent.name}</span>
        <div style={{ display: "flex", justifyContent: "center" }}>
            {choiceEvent.advantages ?
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>+</span>
                    {choiceEvent.advantages.map(x => <KeywordIcon key={x} id={x} />)}
                </div> :
                null
            }
            <ChoiceEventIcon choiceEvent={choiceEvent} scale={0.5} />
            {choiceEvent.advantages ?
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>-</span>
                    {affinities.filter(x => !(choiceEvent.advantages.includes(x))).map(x => <KeywordIcon key={x} id={x} />)}
                </div> :
                null
            }
        </div>
        {choiceEvent.gifts ?
            <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                {choiceEvent.gifts.map(id => <HoverBlocker key={id} setBlockHover={setBlockHover}><Gift id={id} /></HoverBlocker>)}
            </div> :
            null
        }
    </div>
}

function EventsList({ searchString, includeGifts, choiceEvents, giftsData }) {
    const list = useMemo(() =>
        Object.entries(choiceEvents).filter(([, x]) => {
            if (searchString.length !== 0) {
                const filterStrings = [x.name, ...(x.messages)];
                if (includeGifts) x.gifts?.forEach(giftId => filterStrings.push(giftsData[giftId].names[0]));
                return checkFilterMatch(searchString, filterStrings);
            }
            return true;
        }).map(([, x]) => x),
        [searchString, includeGifts, choiceEvents, giftsData]
    );

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "0.25rem" }}>
        <h3 style={{ margin: 0 }}>Results: {list.length}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(375px, 1fr))", width: "100%", gap: "0.5rem", rowGap: "0.5rem" }}>
            {list.map(event => <ChoiceEventCard key={event.id} choiceEvent={event} />)}
        </div>
    </div>
}

export default function MDEventsPage() {
    const [choiceEvents, choiceEventsLoading] = useData("md_choice_events");
    const [gifts, giftsLoading] = useData("gifts");

    const [searchString, setSearchString] = useState("");
    const [includeGifts, setIncludeGifts] = useLocalState("MDEventIncludeGifts", true);

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "1rem", justifyContent: "start" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <span style={{ fontWeight: "bold", textAlign: "end" }}>Search</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "start" }}>
                <input value={searchString} onChange={e => setSearchString(e.target.value)} placeholder={"Search name or option..."} />
                <label>
                    <input type="checkbox" checked={includeGifts} onChange={e => setIncludeGifts(e.target.checked)} />
                    <span {...getGeneralTooltipProps("This will check the names of the gifts that can be obtained from the event.")}
                        style={{ borderBottom: "1px #aaa dotted", cursor: "help" }}
                    >
                        Include Gifts
                    </span>
                </label>
            </div>
        </div>
        <div style={{ border: "1px #777 solid", width: "100%" }} />
        {choiceEventsLoading || giftsLoading ?
            <div style={{ textAlign: "center", fontSize: "1.5rem" }}>Loading Events...</div> :
            <EventsList
                searchString={searchString}
                includeGifts={includeGifts}
                choiceEvents={choiceEvents}
                giftsData={gifts}
            />
        }
    </div>;
}
