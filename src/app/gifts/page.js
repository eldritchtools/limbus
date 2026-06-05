"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useEffect, useMemo, useRef, useState } from "react";

import styles from "./gifts.module.css";
import { useData } from "../components/DataProvider";
import Gift from "../components/gifts/Gift";
import { GiftTagFilterSelector } from "../components/gifts/GiftTags";
import { useModal } from "../components/modals/ModalProvider";
import { HorizontalDivider } from "../components/objects/Dividers";
import IconsSelector from "../components/selectors/IconsSelector";
import { ThemePackDropdownSelector } from "../components/selectors/ThemePackSelectors";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { getLocalStore } from "../database/localDB";
import { affinityColorMapping } from "../lib/colors";
import { checkFilterMatch, filterByFilters } from "../lib/filter";
import { triggerToolUsedGAEvent } from "../lib/gaEvents";
import { TextWithStatuses } from "../lib/statusReplacement";
import useLocalState from "../lib/useLocalState";

function GiftDesc({ gift, clickable }) {
    const { openGiftModal } = useModal();

    return <div
        className={`panel-container ${styles.giftDesc}`}
        onClick={clickable ? () => openGiftModal({ gift, enhanceRank: 0 }) : null}
    >
        <div style={{ marginBottom: "0.5rem", fontSize: "1.25rem", fontWeight: "bold", textAlign: "start", color: affinityColorMapping[gift.affinity] }}>
            {gift.names[0]}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Gift gift={gift} includeTooltip={false} />
            </div>
            <div style={{ display: "inline-block", fontSize: "1rem", lineHeight: "1.5", textWrap: "wrap", whiteSpace: "pre-wrap", textAlign: "start" }}>
                <TextWithStatuses templateText={gift.descs[0]} />
            </div>
        </div>
    </div>
}

function GiftCard({ gift, isSmall, clickable }) {
    const { openGiftModal } = useModal();

    return <div
        className={`panel-container ${styles.giftCard}`}
        style={{ height: isSmall ? "175px" : "250px" }}
        onClick={clickable ? () => openGiftModal({ gift, enhanceRank: 0 }) : null}
    >
        <div style={{ marginBottom: "0.5rem", fontSize: "1.25rem", fontWeight: "bold", textAlign: "center", color: affinityColorMapping[gift.affinity] }}>
            {gift.names[0]}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Gift gift={gift} includeTooltip={false} scale={isSmall ? .6 : 1} />
            </div>
            <div style={{
                display: "inline-block", fontSize: "1rem", lineHeight: "1.5", inlineSize: "50ch", textWrap: "wrap",
                whiteSpace: "pre-wrap", textAlign: "start", height: isSmall ? "150px" : "200px", overflowY: "auto"
            }}>
                <TextWithStatuses templateText={gift.descs[0]} />
            </div>
        </div>
    </div>
}

function GiftList({ gifts, displayType, tracking, setTracking, isSmall }) {
    const listComponents = useMemo(() => {
        const toggleGift = tracking ?
            (id, marked) => {
                const newSet = new Set(tracking);
                if (marked) newSet.delete(Number(id));
                else newSet.add(Number(id));
                setTracking(newSet);
            } :
            null;

        const buildComponent = (id, gift, clickable) => {
            switch (displayType) {
                case "icon": return <Gift key={id} gift={gift} includeTooltip={true} scale={isSmall ? .6 : 1} expandable={clickable} />;
                case "card": return <GiftCard key={id} gift={gift} isSmall={isSmall} clickable={clickable} />;
                case "desc": return <GiftDesc key={id} gift={gift} clickable={clickable} />;
                default: return null;
            }
        };

        const marked = [];
        const unmarked = [];

        gifts.forEach(([id, gift]) => {
            if (tracking) {
                const isMarked = tracking.has(Number(id));
                if (isMarked) {
                    marked.push(<div key={id} onClick={() => toggleGift(id, true)} style={{ filter: "brightness(0.5)" }}>
                        {buildComponent(id, gift, false)}
                    </div>)
                } else {
                    unmarked.push(<div key={id} onClick={() => toggleGift(id, false)}>
                        {buildComponent(id, gift, false)}
                    </div>)
                }
            } else {
                unmarked.push(buildComponent(id, gift, true));
            }
        })

        return [...unmarked, ...marked];
    }, [gifts, displayType, tracking, setTracking, isSmall]);

    const columns = displayType === "icon" ?
        `repeat(auto-fill, minmax(${isSmall ? 60 : 100}px, 1fr))` :
        displayType === "card" ?
            `repeat(auto-fill, minmax(${isSmall ? "100%" : "400px"}, 1fr))` :
            "1fr"

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Results: {listComponents.length}</h3>
        <span className="sub-text" style={{ marginBottom: ".5rem" }}>
            This count may include gifts that are no longer obtainable or are not part of the gift compendium.
        </span>
        <div style={{ display: "grid", gridTemplateColumns: columns, width: "100%", rowGap: "0.5rem" }}>
            {listComponents}
        </div>
    </div>
}

export default function GiftsPage() {
    const [giftsData, giftsLoading] = useData("gifts");
    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useState([]);
    const [includeDescription, setIncludeDescription] = useLocalState("giftsIncludeDescription", false);
    const [displayType, setDisplayType] = useLocalState("giftsDisplayType", "icon");
    const [strictFiltering, setStrictFiltering] = useLocalState("giftsStrictFiltering", false);
    const [tagFilters, setTagFilters] = useState([]);
    const [tagFilterExcluding, setTagFilterExcluding] = useState(false);
    const [selectedThemePacks, setSelectedThemePacks] = useState([]);
    const { isDesktop } = useBreakpoint();

    const newGifts = useMemo(() => giftsLoading ? [] : Object.entries(giftsData).filter(([, gift]) => gift.new), [giftsData, giftsLoading]);
    const updatedGifts = useMemo(() => giftsLoading ? [] : Object.entries(giftsData).filter(([, gift]) => gift.updated), [giftsData, giftsLoading]);

    const [loading, setLoading] = useState(true);
    const [tracking, setTracking] = useState(null);
    const saveTimeout = useRef(null);
    const [firstSave, setFirstSave] = useState(true);

    const themePackList = useMemo(() => {
        if(giftsLoading) return [];
        const packs = new Set();
        Object.values(giftsData).forEach(gift => {
            if ("exclusiveTo" in gift) packs.add(...gift.exclusiveTo);
        });
        return [...packs].sort();
    }, [giftsData, giftsLoading]);

    const filteredGifts = useMemo(() => {
        if (giftsLoading) return [];
        const combinedFilters = [...filters, ...tagFilters.map(tag => ["tag", tag])];
        const packSet = new Set(selectedThemePacks);

        return filterByFilters(
            "gift",
            Object.values(giftsData),
            combinedFilters,
            gift => {
                if (searchString.length !== 0) {
                    const filterStrings = [gift.names[0]];
                    if (includeDescription) filterStrings.push(gift.search_desc);
                    if (!checkFilterMatch(searchString, filterStrings)) return false;
                }
                if (selectedThemePacks.length !== 0) {
                    if(!("exclusiveTo" in gift)) return false;
                    if (!gift.exclusiveTo.some(x => packSet.has(x))) return false;
                }
                return true;
            },
            strictFiltering
        ).map(x => [x.id, x]);
    }, [filters, tagFilters, giftsData, giftsLoading, searchString, includeDescription, strictFiltering, selectedThemePacks]);

    useEffect(() => {
        if (loading) {
            getLocalStore("giftsTracking").get("main").then(x => {
                setLoading(false);
                if (!x) return;
                setTracking(new Set(x.gifts));
            });
        }
    }, [loading]);

    useEffect(() => {
        if (loading || !tracking) return;

        const saveData = async () => {
            if (firstSave) {
                triggerToolUsedGAEvent("Gifts Tracking");
                setFirstSave(false);
            }

            const data = { id: "main", gifts: [...tracking] };
            if (data.gifts.length === 0)
                getLocalStore("giftsTracking").remove("main");
            else
                getLocalStore("giftsTracking").save(data);
        };

        clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(async () => {
            try {
                await saveData();
            } catch (err) {
                console.error("Unable to persist data.");
            }
        }, 1000);

        return () => clearTimeout(saveTimeout.current);
    }, [tracking, loading, firstSave]);

    const toggleTracking = () => {
        if (tracking) {
            setTracking(null);
            return;
        }

        getLocalStore("giftsTracking").get("main").then(x => {
            if (x) setTracking(new Set(x.gifts));
            else setTracking(new Set());
        });
    }

    const trackingFuncs = tracking ? {
        markAll: () => {
            const newSet = new Set(tracking);
            filteredGifts.forEach(([id]) => newSet.add(Number(id)));
            setTracking(newSet);
        },
        unmarkAll: () => {
            const newSet = new Set(tracking);
            filteredGifts.forEach(([id]) => newSet.delete(Number(id)));
            setTracking(newSet);
        },
        resetTracking: () => {
            setTracking(new Set());
            getLocalStore("universalTracking").remove("main");
        }
    } : {};

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "1rem", alignItems: "center" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>E.G.O Gifts</h1>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Search</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "start" }}>
                    <input value={searchString} onChange={e => setSearchString(e.target.value)} />
                    <label>
                        <input type="checkbox" checked={includeDescription} onChange={e => setIncludeDescription(e.target.checked)} />
                        <span {...getGeneralTooltipProps("This will check the description for all enhancement levels of the gift.")}
                            className="hover-text"
                        >
                            Include Description
                        </span>
                    </label>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "end", textAlign: "end", gap: "0.2rem" }}>
                    <span style={{ fontWeight: "bold", textAlign: "end" }}>Tag Filter</span>
                    <div
                        className={`toggle-text ${tagFilterExcluding ? "red" : "green"}`}
                        onClick={() => setTagFilterExcluding(p => !p)}
                    >
                        {tagFilterExcluding ? "Exclude" : "Include"}
                    </div>
                </div>
                <div style={{ textAlign: "start" }}>
                    <GiftTagFilterSelector tagFilter={tagFilters} setTagFilter={setTagFilters} excludeMode={tagFilterExcluding} />
                </div>
                <div />
                <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.2rem", flexWrap: "wrap" }}>
                        <input type="checkbox" checked={strictFiltering} onChange={e => setStrictFiltering(e.target.checked)} />
                        Strict Tag Filtering
                        <span className="sub-text">(Require all selected tags)</span>
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
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Display Type</span>
                <div style={{ display: "flex", gap: "0.2rem", alignItems: "start" }}>
                    <label>
                        <input type="radio" name="displayType" value={"icon"} checked={displayType === "icon"} onChange={e => setDisplayType(e.target.value)} />
                        Icons Only
                    </label>
                    <label>
                        <input type="radio" name="displayType" value={"card"} checked={displayType === "card"} onChange={e => setDisplayType(e.target.value)} />
                        Cards
                    </label>
                    <label>
                        <input type="radio" name="displayType" value={"desc"} checked={displayType === "desc"} onChange={e => setDisplayType(e.target.value)} />
                        Full Description
                    </label>
                </div>
            </div>
            <IconsSelector type={"column"} categories={["giftTier", "status", "atkTypeKwless", "affinity"]} values={filters} setValues={setFilters} />
        </div>
        <div style={{ display: "flex", gap: "0.25rem" }}>
            <button onClick={() => toggleTracking()}>
                {tracking === null ? "Activate Tracking Mode" : "Deactivate Tracking Mode"}
            </button>
            {
                tracking && <>
                    <button onClick={trackingFuncs.markAll}>
                        Mark all Filtered
                    </button>
                    <button onClick={trackingFuncs.unmarkAll}>
                        Unmark all Filtered
                    </button>
                    <button onClick={trackingFuncs.resetTracking}>
                        Reset Tracking
                    </button>
                </>
            }
        </div>
        <HorizontalDivider />
        {filters.length === 0 && tagFilters.length === 0 && searchString.length === 0 && selectedThemePacks.length === 0 ?
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", width: "100%" }}>
                {newGifts.length > 0 ? <React.Fragment>
                    <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>New</span>
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isDesktop ? 100 : 60}px, 1fr))`, width: "100%", rowGap: "0.5rem" }}>
                        {newGifts.map(([id, gift]) => <Gift key={id} gift={gift} includeTooltip={true} scale={isDesktop ? 1 : 0.6} />)}
                    </div>
                </React.Fragment> : null}
                {updatedGifts.length > 0 ? <React.Fragment>
                    <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Updated</span>
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isDesktop ? 100 : 60}px, 1fr))`, width: "100%", rowGap: "0.5rem" }}>
                        {updatedGifts.map(([id, gift]) => <Gift key={id} gift={gift} includeTooltip={true} scale={isDesktop ? 1 : 0.6} />)}
                    </div>
                </React.Fragment> : null}
            </div> :
            null}
        {giftsLoading ?
            <div style={{ textAlign: "center", fontSize: "1.5rem" }}>Loading Gifts...</div> :
            <GiftList
                gifts={filteredGifts}
                displayType={displayType}
                tracking={tracking}
                setTracking={setTracking}
                isSmall={!isDesktop}
            />
        }
    </div>;
}
