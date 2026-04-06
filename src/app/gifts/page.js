"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useMemo, useState } from "react";
import Select from "react-select";

import styles from "./gifts.module.css";
import { useData } from "../components/DataProvider";
import { useModal } from "../components/modals/ModalProvider";
import Gift from "../components/objects/Gift";
import IconsSelector from "../components/selectors/IconsSelector";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { affinityColorMapping, giftTagColors } from "../lib/colors";
import { checkFilterMatch, filterByFilters } from "../lib/filter";
import { TextWithStatuses } from "../lib/statusReplacement";
import useLocalState from "../lib/useLocalState";
import { selectStyleVariable } from "../styles/selectStyle";

function GiftDesc({ gift, tagStrips }) {
    const { openGiftModal } = useModal();

    return <div
        className={styles.giftDesc}
        onClick={() => openGiftModal({ gift, enhanceRank: 0 })}
    >
        <div style={{ marginBottom: "0.5rem", fontSize: "1.25rem", fontWeight: "bold", textAlign: "start", color: affinityColorMapping[gift.affinity] }}>
            {gift.names[0]}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Gift gift={gift} includeTooltip={false} tagStrips={tagStrips} />
            </div>
            <div style={{ display: "inline-block", fontSize: "1rem", lineHeight: "1.5", textWrap: "wrap", whiteSpace: "pre-wrap", textAlign: "start" }}>
                <TextWithStatuses templateText={gift.descs[0]} />
            </div>
        </div>
    </div>
}

function GiftCard({ gift, isSmall, tagStrips }) {
    const { openGiftModal } = useModal();

    return <div
        className={styles.giftCard}
        style={{ height: isSmall ? "175px" : "250px" }}
        onClick={() => openGiftModal({ gift, enhanceRank: 0 })}
    >
        <div style={{ marginBottom: "0.5rem", fontSize: "1.25rem", fontWeight: "bold", textAlign: "center", color: affinityColorMapping[gift.affinity] }}>
            {gift.names[0]}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Gift gift={gift} includeTooltip={false} scale={isSmall ? .6 : 1} tagStrips={tagStrips} />
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

function GiftList({ searchString, filters, tagFilter, tagFilterExcluding, includeDescription, displayType, showTagStrips, giftsData, isSmall }) {
    const list = useMemo(() => {
        const combinedFilters = [...filters];
        if (tagFilter) {
            if (tagFilterExcluding) combinedFilters.push(["tag", `-${tagFilter}`]);
            else combinedFilters.push(["tag", tagFilter]);
        }

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
                return true;
            }
        ).map(x => [x.id, x])
    }, [searchString, filters, tagFilter, tagFilterExcluding, includeDescription, giftsData]);

    const listComponents = list.map(([id, gift]) => {
        switch (displayType) {
            case "icon": return <Gift key={id} gift={gift} includeTooltip={true} scale={isSmall ? .6 : 1} tagStrips={showTagStrips} />;
            case "card": return <GiftCard key={id} gift={gift} isSmall={isSmall} tagStrips={showTagStrips} />;
            case "desc": return <GiftDesc key={id} gift={gift} tagStrips={showTagStrips} />;
            default: return null;
        }
    });

    const columns = displayType === "icon" ?
        `repeat(auto-fill, minmax(${isSmall ? 60 : 100}px, 1fr))` :
        displayType === "card" ?
            `repeat(auto-fill, minmax(${isSmall ? "100%" : "400px"}, 1fr))` :
            "1fr"

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Results: {listComponents.length}</h3>
        <span style={{ fontSize: "0.8rem", color: "#aaa", marginBottom: ".5rem" }}>
            This count may include gifts that are no longer obtainable or are not part of the gift compendium.
        </span>
        <div style={{ display: "grid", gridTemplateColumns: columns, width: "100%", rowGap: "0.5rem" }}>
            {listComponents}
        </div>
    </div>
}

function TagFilterSelector({ tagFilter, setTagFilter }) {
    const options = [
        { value: "Enhanceable", label: <span style={{ color: giftTagColors.enhanceable }}>Enhanceable</span> },
        { value: "Ingredient", label: <span style={{ color: giftTagColors.ingredient }}>Ingredient</span> },
        { value: "Fusion Only", label: <span style={{ color: giftTagColors.fusion }}>Fusion Only</span> },
        { value: "Hard Only", label: <span style={{ color: giftTagColors.hardonly }}>Hard Only</span> },
        { value: "Cursed", label: <span style={{ color: giftTagColors.cursed }}>Cursed</span> },
        { value: "Blessed", label: <span style={{ color: giftTagColors.blessed }}>Blessed</span> },
    ]

    return <Select
        isClearable={true}
        options={options}
        value={tagFilter ? options.find(x => x.value === tagFilter) : null}
        onChange={x => setTagFilter(x ? x.value : null)}
        styles={selectStyleVariable}
    />
}

export default function GiftsPage() {
    const [giftsData, giftsLoading] = useData("gifts");
    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useState([]);
    const [includeDescription, setIncludeDescription] = useLocalState("giftsIncludeDescription", false);
    const [displayType, setDisplayType] = useLocalState("giftsDisplayType", "icon");
    const [tagFilter, setTagFilter] = useState(null);
    const [tagFilterExcluding, setTagFilterExcluding] = useState(false);
    const [showTagStrips, setShowTagStrips] = useState(false);
    const { isDesktop } = useBreakpoint();

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "1rem", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Search</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "start" }}>
                    <input value={searchString} onChange={e => setSearchString(e.target.value)} />
                    <label>
                        <input type="checkbox" checked={includeDescription} onChange={e => setIncludeDescription(e.target.checked)} />
                        <span {...getGeneralTooltipProps("This will check the description for all enhancement levels of the gift.")}
                            style={{ borderBottom: "1px #aaa dotted", cursor: "help" }}
                        >
                            Include Description
                        </span>
                    </label>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "end", textAlign: "end", gap: "0.2rem" }}>
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
                    <TagFilterSelector tagFilter={tagFilter} setTagFilter={setTagFilter} />
                </div>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Display Type</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "start" }}>
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
                <div />
                <div style={{ display: "flex" }}>
                    <label>
                        <input type="checkbox" checked={showTagStrips} onChange={e => setShowTagStrips(e.target.checked)} />
                        <span {...getGeneralTooltipProps("Display colored strips on gifts to quickly see their tags. (Experimental Feature)")}
                            style={{ borderBottom: "1px #aaa dotted", cursor: "help" }}
                        >
                            Show Tag Strips
                        </span>
                    </label>
                </div>
            </div>
            <IconsSelector type={"column"} categories={["giftTier", "status", "atkTypeKwless", "affinity"]} values={filters} setValues={setFilters} />
        </div>
        <div style={{ border: "1px #777 solid", width: "100%" }} />
        {giftsLoading ?
            <div style={{ textAlign: "center", fontSize: "1.5rem" }}>Loading Gifts...</div> :
            <GiftList
                searchString={searchString}
                filters={filters}
                tagFilter={tagFilter}
                tagFilterExcluding={tagFilterExcluding}
                includeDescription={includeDescription}
                displayType={displayType}
                showTagStrips={showTagStrips}
                giftsData={giftsData}
                isSmall={!isDesktop}
            />
        }
    </div>;
}
