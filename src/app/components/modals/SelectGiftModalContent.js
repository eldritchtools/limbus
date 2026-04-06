import { useBreakpoint } from "@eldritchtools/shared-components";
import { useState, useCallback } from "react";
import Select from "react-select";

import { useData } from "../DataProvider";
import Gift from "../objects/Gift";
import IconsSelector from "../selectors/IconsSelector";

import { giftTagColors } from "@/app/lib/colors";
import { checkFilterMatch, filterByFilters } from "@/app/lib/filter";
import { selectStyleVariable } from "@/app/styles/selectStyle";

const tagCheck = {
    "Enhanceable": x => x.enhanceable,
    "Ingredient": x => x.ingredientOf,
    "Fusion Only": x => x.fusion,
    "Hard Only": x => x.hardonly,
    "Cursed": x => x.cursedPair,
    "Blessed": x => x.blessedPair
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

export default function SelectGiftModalContent({ title, getChoiceList, showSearch = false, onSelectGift, forcedFilter }) {
    const [giftsData, giftsLoading] = useData("gifts");
    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useState([]);
    const [tagFilter, setTagFilter] = useState(null);
    const [tagFilterExcluding, setTagFilterExcluding] = useState(false);
    const [, updateCount] = useState(0);
    const { isMobile } = useBreakpoint();

    const triggerRender = useCallback(() => { updateCount(p => p + 1) }, []);

    const handleSelectGift = id => {
        onSelectGift(id);

        setTimeout(() => {
            triggerRender();
        }, 0);
    }

    const composedSearchFilter = gift => {
        if (searchString.length > 0 && !checkFilterMatch(searchString, [gift.names[0], gift.search_desc])) return false;
        if (forcedFilter && !forcedFilter(gift)) return false;
        if (tagFilter) {
            if (tagFilterExcluding) {
                if (tagCheck[tagFilter](gift)) return false;
            } else {
                if (!tagCheck[tagFilter](gift)) return false;
            }
        }
        return true;
    };

    const searchGiftList = giftsLoading ? [] : filterByFilters("gift", Object.values(giftsData), filters, composedSearchFilter);

    if (giftsLoading) return <div />

    const choiceList = getChoiceList ? getChoiceList() : null;
    const giftSize = isMobile ? 60 : 80;

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem", maxHeight: "min(800px, 90vh)", overflowY: "auto", overflowX: "hidden", maxWidth: "min(80vw, 1000px)" }}>
        {title ? <h2>{title}</h2> : null}
        {choiceList && choiceList.length > 0 ?
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${giftSize}px, 1fr))`, width: `min(80vw, 1000px, ${giftSize * choiceList.length}px)`, rowGap: "0.5rem" }}>
                {choiceList
                    .filter(id => {
                        if (forcedFilter) return forcedFilter(giftsData[id]);
                        return true;
                    })
                    .map(id =>
                        <div key={id} onClick={() => handleSelectGift(id)}>
                            <Gift id={id} includeTooltip={true} expandable={false} scale={isMobile ? .6 : .8} />
                        </div>
                    )}
            </div> :
            null
        }
        {choiceList && choiceList.length > 0 && showSearch ?
            <div style={{ width: "100%", border: "1px #aaa solid" }} /> :
            null
        }
        {showSearch ?
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
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
                            <TagFilterSelector tagFilter={tagFilter} setTagFilter={setTagFilter} />
                        </div>
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
                        {searchGiftList.map(gift =>
                            <div key={gift.id} onClick={() => handleSelectGift(gift.id)} >
                                <Gift gift={gift} includeTooltip={true} expandable={false} scale={isMobile ? .6 : .8} />
                            </div>
                        )}
                    </div>
                }
            </div> :
            null
        }
    </div>
}