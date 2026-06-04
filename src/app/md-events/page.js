"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useMemo, useState } from "react";

import styles from "./mdEvents.module.css";
import { useData } from "../components/DataProvider";
import Gift from "../components/gifts/Gift";
import HoverBlocker from "../components/HoverBlocker";
import ChoiceEventIcon from "../components/icons/ChoiceEventIcon";
import KeywordIcon from "../components/icons/KeywordIcon";
import { useModal } from "../components/modals/ModalProvider";
import { HorizontalDivider } from "../components/objects/Dividers";
import { ThemePackDropdownSelector } from "../components/selectors/ThemePackSelectors";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { affinities } from "../lib/constants";
import { checkFilterMatch } from "../lib/filter";
import useLocalState from "../lib/useLocalState";
import { selectStyle, selectStyleVariable, selectStyleWide } from "../styles/selectStyle";

function ChoiceEventCard({ choiceEvent }) {
    const { openChoiceEventModal } = useModal();
    const [blockHover, setBlockHover] = useState(false);
    const { isMobile } = useBreakpoint();

    return <div
        className={`panel-container ${styles.choiceEventCard} ${!blockHover ? styles.canHover : null}`}
        onClick={() => { if (!blockHover) openChoiceEventModal({ choiceEvent }) }}
        style={{ minWidth: isMobile ? "300px" : "375px" }}
    >
        <span style={{ fontSize: "1.1rem", fontWeight: "bold", textAlign: "center" }}>{choiceEvent.name === "" ? "[Unnamed Event]" : choiceEvent.name}</span>
        <div style={{ display: "flex", justifyContent: "center" }}>
            {choiceEvent.advantages ?
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>+</span>
                    {choiceEvent.advantages.map(x => <KeywordIcon key={x} id={x} size={isMobile ? 24 : 32} />)}
                </div> :
                null
            }
            <ChoiceEventIcon choiceEvent={choiceEvent} scale={isMobile ? 0.3 : 0.5} />
            {choiceEvent.advantages ?
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>-</span>
                    {affinities.filter(x => !(choiceEvent.advantages.includes(x))).map(x => <KeywordIcon key={x} id={x} size={isMobile ? 24 : 32} />)}
                </div> :
                null
            }
        </div>
        {choiceEvent.gifts ?
            <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                {choiceEvent.gifts.map(id => <HoverBlocker key={id} setBlockHover={setBlockHover}><Gift id={id} scale={isMobile ? 0.7 : 1} /></HoverBlocker>)}
            </div> :
            null
        }
    </div>
}

function EventsList({ searchString, includeGifts, choiceEvents, giftsData }) {
    const { isMobile } = useBreakpoint();

    const list = useMemo(() =>
        choiceEvents.filter(x => {
            if (searchString.length !== 0) {
                const filterStrings = [x.name, ...(x.messages)];
                if (includeGifts) x.gifts?.forEach(giftId => filterStrings.push(giftsData[giftId].names[0]));
                return checkFilterMatch(searchString, filterStrings);
            }
            return true;
        }),
        [searchString, includeGifts, choiceEvents, giftsData]
    );

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "0.25rem" }}>
        <h3 style={{ margin: 0 }}>Results: {list.length}</h3>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 300 : 375}px, 1fr))`, width: "100%", gap: "0.5rem", rowGap: "0.5rem" }}>
            {list.map(event => <ChoiceEventCard key={event.id} choiceEvent={event} />)}
        </div>
    </div>
}

export default function MDEventsPage() {
    const [choiceEvents, choiceEventsLoading] = useData("md_choice_events");
    const [themePacks, themePacksLoading] = useData("md_theme_packs");
    const [gifts, giftsLoading] = useData("gifts");

    const [searchString, setSearchString] = useState("");
    const [includeGifts, setIncludeGifts] = useLocalState("MDEventIncludeGifts", true);
    const [selectedThemePacks, setSelectedThemePacks] = useState([]);

    const themePackList = useMemo(() => {
        if(themePacksLoading) return [];
        return Object.entries(themePacks).filter(([id, pack]) => "eventPool" in pack && pack.eventPool.length > 0).map(([id]) => id)
    }, [themePacks, themePacksLoading]);

    const packEvents = useMemo(() => {
        if(choiceEventsLoading) return [];
        if(themePacksLoading || selectedThemePacks.length === 0) return Object.values(choiceEvents);
        const events = new Set();
        selectedThemePacks.forEach(id => 
            themePacks[id].eventPool.forEach(x => events.add(x))
        );

        return [...events].map(id => choiceEvents[id]).filter(x => x);
    }, [selectedThemePacks, themePacks, choiceEvents, themePacksLoading, choiceEventsLoading])

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "1rem", justifyContent: "start" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Choice Events</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <span style={{ fontWeight: "bold", textAlign: "end" }}>Search</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "start" }}>
                <input value={searchString} onChange={e => setSearchString(e.target.value)} placeholder={"Search name or option..."} />
                <label>
                    <input type="checkbox" checked={includeGifts} onChange={e => setIncludeGifts(e.target.checked)} />
                    <span {...getGeneralTooltipProps("This will check the names of the gifts that can be obtained from the event.")}
                        className="hover-text"
                    >
                        Include Gifts
                    </span>
                </label>
            </div>
            <span style={{ fontWeight: "bold", textAlign: "end" }}>Theme Packs</span>
            <ThemePackDropdownSelector
                selected={selectedThemePacks}
                setSelected={setSelectedThemePacks}
                isMulti={true}
                options={themePackList}
                prefixCategory={true}
            />
        </div>
        <HorizontalDivider />
        {choiceEventsLoading || giftsLoading ?
            <div style={{ textAlign: "center", fontSize: "1.5rem" }}>Loading Events...</div> :
            <EventsList
                searchString={searchString}
                includeGifts={includeGifts}
                choiceEvents={packEvents}
                giftsData={gifts}
            />
        }
    </div>;
}
