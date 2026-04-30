"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import * as Select from "@radix-ui/react-select";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import styles from "./floorPlanner.module.css";
import { useData } from "../components/DataProvider";
import Gift from "../components/gifts/Gift";
import { GiftTagFilterSelector } from "../components/gifts/GiftTags";
import ThemePackIcon from "../components/icons/ThemePackIcon";
import NoPrefetchLink from "../components/NoPrefetchLink";
import ThemePackWithFloors from "../components/objects/ThemePackWithFloors";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import IconsSelector from "../components/selectors/IconsSelector";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { checkFilterMatch, filterByFilters } from "../lib/filter";
import useLocalState from "../lib/useLocalState";

function FloorSelector({ value, setValue, options, isSmall }) {
    const [isOpen, setIsOpen] = useState(false);

    const triggerRef = useRef(null);

    const sizeStyle = isSmall ? { width: "125px", height: "240px" } : { width: "200px", height: "350px" };

    return <Select.Root value={value} onValueChange={x => setValue(x)} open={isOpen} onOpenChange={setIsOpen}>
        <Select.Trigger className={styles.floorSelectTrigger} ref={triggerRef} style={sizeStyle}>
            {value ? <ThemePackIcon id={value} displayName={true} scale={isSmall ? .3 : 0.45} /> : null}
        </Select.Trigger>

        <Select.Content className={styles.floorSelectContent} position="popper">
            <Select.Viewport>
                <div className={styles.floorSelectGrid}>
                    {options.map((option) =>
                        <Select.Item key={option} value={option} className={styles.floorSelectItem}>
                            <div className={styles.floorItemInner}>
                                <ThemePackIcon id={option} displayName={true} scale={isSmall ? .15 : 0.25} />
                            </div>
                        </Select.Item>
                    )}
                    {value ? <Select.Item key={"cancel"} value={null} className={styles.floorSelectItem}>
                        <div className={styles.floorItemInner} style={{
                            height: "100%", justifyContent: "center",
                            color: "#ff4848", fontSize: "3rem", fontWeight: "bold"
                        }}>
                            ✕
                        </div>
                    </Select.Item> : null}
                </div>
                {options.length > 10 ? <div className={styles.floorSelectFadeBottom} > ▼ </div> : null}
            </Select.Viewport>
        </Select.Content>
    </Select.Root>;
}

function ExclusiveGiftList({selectedFloors}) {
    const [giftsData, giftsLoading] = useData("gifts");
    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useState([]);
    const [tagFilter, setTagFilter] = useState(null);
    const [tagFilterExcluding, setTagFilterExcluding] = useState(false);
    const [selectedGifts, setSelectedGifts] = useLocalState("floorPlannerSelectedGifts", []);
    const { isMobile } = useBreakpoint();
    const giftSize = isMobile ? 60 : 80;

    const themePacks = useMemo(() => giftsLoading ? {} :
        Object.entries(selectedGifts.reduce((acc, giftId) => {
            (giftsData[giftId]?.exclusiveTo ?? []).forEach(id => {
                if (id in acc) acc[id].push(giftId);
                else acc[id] = [giftId];
            });
            return acc
        }, {}))
            .filter(([id,]) => !selectedFloors.includes(id))
            .sort(([aId, aList], [bId, bList]) => bList.length === aList.length ? aId.localeCompare(bId) : bList.length - aList.length),
        [giftsData, giftsLoading, selectedFloors, selectedGifts]
    );

    const [selGifts, unselGifts] = useMemo(() => {
        if (giftsLoading) return [];
        const combinedFilters = [...filters];
        if (tagFilter) {
            if (tagFilterExcluding) combinedFilters.push(["tag", `-${tagFilter}`]);
            else combinedFilters.push(["tag", tagFilter]);
        }

        const filteredGifts = filterByFilters(
            "gift",
            Object.values(giftsData),
            combinedFilters,
            gift => {
                if (!gift.exclusiveTo) return false;
                if (searchString.length > 0 && !checkFilterMatch(searchString, [gift.names[0], gift.search_desc])) return false;
                return true;
            }
        );

        return filteredGifts.reduce(([sel, unsel], gift) => {
            if (selectedGifts.includes(gift.id)) sel.push(gift.id);
            else unsel.push(gift.id);
            return [sel, unsel]
        }, [[], []]);
    }, [giftsData, giftsLoading, filters, tagFilter, tagFilterExcluding, searchString, selectedGifts]);

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
        <h3 style={{ margin: "0.5rem", textAlign: "center" }}>Exclusive Gifts Helper</h3>
        {themePacks.length > 0 ?
            <div style={{ padding: "0.5rem", border: "1px #aaa solid", borderRadius: "1rem", overflowX: "auto", width: "100%" }}>
                <div style={{ display: "flex", gap: "0.2rem" }}>
                    {themePacks.map(([id, gifts]) =>
                        <div
                            key={id}
                            style={{
                                display: "flex", alignItems: "center", height: "350px", gap: "0.2rem",
                                border: "1px #aaa solid", borderRadius: "1rem", padding: "1rem", boxSizing: "border-box"
                            }}
                        >
                            <div style={{ height: "fit-content", boxSizing: "border-box" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "3px" }}>
                                    <ThemePackWithFloors id={id} scale={0.4} />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridAutoFlow: "column", gridTemplateRows: "repeat(4, 1fr)" }}>
                                {gifts.map(giftId => <Gift key={giftId} id={giftId} scale={.7} />)}
                            </div>
                        </div>
                    )}
                </div>
            </div> :
            null
        }
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Search</span>
                <input value={searchString} onChange={e => setSearchString(e.target.value)} placeholder="Search gifts..." />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "end", textAlign: "end", gap: "0.15rem" }}>
                    <span style={{ fontWeight: "bold", textAlign: "end" }}>Tag Filter</span>
                    <div
                        className="toggle-text"
                        onClick={() => setTagFilterExcluding(p => !p)}
                        style={{ color: tagFilterExcluding ? "#f87171" : "#4ade80" }}
                    >
                        {tagFilterExcluding ? "Exclude" : "Include"}
                    </div>
                </div>
                <div style={{ textAlign: "start" }}>
                    <GiftTagFilterSelector tagFilter={tagFilter} setTagFilter={setTagFilter} />
                </div>
                <div />
                <button onClick={() => setSelectedGifts([])}>Reset Gifts</button>
            </div>

            <IconsSelector
                type={"row"}
                categories={["giftTier", "status", "atkType", "keywordless", "affinity"]}
                values={filters} setValues={setFilters}
                borderless={true}
            />
        </div>
        <div style={{ border: "1px #777 solid", width: "100%" }} />
        {giftsLoading ?
            <div style={{ textAlign: "center", fontSize: "1.2rem" }}>Loading Gifts...</div> :
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${giftSize}px, 1fr))`, width: "100%", rowGap: "0.5rem" }}>
                {selGifts.map(gift =>
                    <div key={gift} onClick={() => setSelectedGifts(p => p.filter(id => id !== gift))} style={{ filter: "brightness(1.3)" }} >
                        <Gift id={gift} includeTooltip={true} expandable={false} scale={isMobile ? .6 : .8} />
                    </div>
                )}
                {unselGifts.map(gift =>
                    <div key={gift} onClick={() => setSelectedGifts(p => [...p, gift])} style={{ filter: "brightness(0.6)" }}>
                        <Gift id={gift} includeTooltip={true} expandable={false} scale={isMobile ? .6 : .8} />
                    </div>
                )}
            </div>
        }
    </div>
}

export default function FloorPlannerPage() {
    const [themePacks, themePacksLoading] = useData("md_theme_packs");
    const [floorPacks, floorPacksLoading] = useData("md_floor_packs");
    const { isDesktop } = useBreakpoint();

    const [selectedFloors, setSelectedFloors] = useLocalState("floorPlannerFloors", new Array(15).fill(null));
    const [difficulty, setDifficulty] = useLocalState("floorPlannerDifficulty", "E");
    const [showExclusiveHelper, setShowExclusiveHelper] = useLocalState("floorPlannerShowExclusiveHelper", false);

    const router = useRouter();

    const handleSetDifficulty = v => {
        if (difficulty === "N" || v === "N") setSelectedFloors(new Array(15).fill(null));
        setDifficulty(v);
    }

    const clear = () => {
        setSelectedFloors(new Array(15).fill(null));
    }

    const copyToMdPlan = () => {
        const params = new URLSearchParams({ difficulty, floors: selectedFloors });
        router.push(`/md-plans/new?${params.toString()}`)
    }

    const setSelectedFloor = (value, index) => {
        setSelectedFloors(selectedFloors.map((f, i) => i === index ? value : f));
    }

    const getOptions = floor => {
        let options = [];
        if (floor <= 5) {
            if (difficulty === "N") options = floorPacks.normal[floor];
            else options = floorPacks.hard[floor];
        } else if (floor <= 10) {
            options = floorPacks.hard["6-10"];
        } else {
            options = floorPacks.hard["11-15"];
        }
        return options.filter(pack => !selectedFloors.includes(pack));
    }

    const floors = difficulty === "E" ? 15 : (difficulty === "I" ? 10 : 5);
    const size = isDesktop ? "400px" : "330px";

    if (themePacksLoading || floorPacksLoading) return <LoadingContentPageTemplate />;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%" }}>
        <h2 style={{ margin: 0 }}>Floor Planner</h2>
        <span style={{ maxWidth: "1000px", textAlign: "center" }}>This tool is made to be used as a quick way to view and plan theme pack options per floor. If you want to create and share a floor plan, please create an <NoPrefetchLink className="text-link" href="/md-plans/new">MD Plan</NoPrefetchLink> instead. You can also copy a floor plan you made here into an MD Plan using the button below. Additionally, the exclusive gifts helper displays the list of all theme pack exclusive gifts and the list of theme packs needed to get the ones you&apos;ve selected.</span>
        <div style={{ display: "flex", flexDirection: "row", gap: "0.2rem", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
            <label>
                <span {...getGeneralTooltipProps("Changing to or from Normal will reset all selected theme packs.")}
                    style={{ marginRight: "0.2rem", borderBottom: "1px #aaa dotted" }}>
                    Select Difficulty:
                </span>
                <select name="difficulty" id="difficulty" value={difficulty} onChange={e => handleSetDifficulty(e.target.value)}>
                    <option value="N">Normal</option>
                    <option value="H">Hard</option>
                    <option value="I">Infinity</option>
                    <option value="E">Extreme</option>
                </select>
            </label>
            <button onClick={clear}>Clear</button>
            <button onClick={() => setShowExclusiveHelper(p => !p)}>{showExclusiveHelper ? "Hide " : "Show "}Exclusive Gifts Helper</button>
            <button onClick={copyToMdPlan}>Copy to MD Plan</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, ${size})`, justifyContent: "center", width: "100%", gap: "0.5rem" }}>
            {Array.from({ length: floors }).map((_, index) =>
                <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr auto", width: size }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span>Floor {index + 1}</span>
                        {
                            selectedFloors[index] && "exclusive_gifts" in themePacks[selectedFloors[index]] ?
                                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                                    {themePacks[selectedFloors[index]].exclusive_gifts.map(giftId =>
                                        <Gift key={giftId} id={giftId} includeTooltip={true} scale={isDesktop ? .66 : .5} />
                                    )}
                                </div> :
                                null
                        }
                    </div>
                    <FloorSelector
                        value={selectedFloors[index]}
                        setValue={v => setSelectedFloor(v, index)}
                        options={getOptions(index + 1)}
                        isSmall={!isDesktop}
                    />
                </div>
            )}
        </div>
        {showExclusiveHelper ?
            <ExclusiveGiftList selectedFloors={selectedFloors} /> :
            null
        }
    </div>;
}