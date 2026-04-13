import React from "react";
import Select from "react-select";

import Gift from "./Gift";

import { giftTagColors } from "@/app/lib/colors";
import { selectStyleVariable } from "@/app/styles/selectStyle";

export function GiftTagStrips({ gift, scale }) {
    const scaledSize = { width: `${12 * scale}px`, height: `${4 * scale}px` };
    return <div style={{ display: "flex", flexDirection: "column", gap: "2px", position: "absolute", bottom: "50%", left: "0" }}>
        {gift.enhanceable ? <div style={{ ...scaledSize, background: giftTagColors.enhanceable }} /> : null}
        {gift.ingredientOf ? <div style={{ ...scaledSize, background: giftTagColors.ingredient }} /> : null}
        {gift.fusion ? <div style={{ ...scaledSize, background: giftTagColors.fusion }} /> : null}
        {gift.hardonly ? <div style={{ ...scaledSize, background: giftTagColors.hardonly }} /> : null}
        {gift.events ? <div style={{ ...scaledSize, background: giftTagColors.eventreward }} /> : null}
        {gift.hidden ? <div style={{ ...scaledSize, background: giftTagColors.hidden }} /> : null}
        {gift.cursedPair ? <div style={{ ...scaledSize, background: giftTagColors.cursed }} /> : null}
        {gift.blessedPair ? <div style={{ ...scaledSize, background: giftTagColors.blessed }} /> : null}
    </div>
}

export function GiftTagLabels({ gift, full = false, enhanceLevel, setEnhanceLevel }) {
    return <React.Fragment>
        {gift.enhanceable ? (
            full ?
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${gift.names.length}, 2rem)` }}>
                    {Array.from({ length: gift.names.length }, (_, index) =>
                        <div key={index}
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "center", border: "1px #aaa solid", padding: "4px",
                                cursor: "pointer", transiton: "background-color 0.2s, border-color 0.2s",
                                backgroundColor: enhanceLevel === index ? "#3f3f3f" : "#1f1f1f"
                            }}
                            onClick={() => setEnhanceLevel(index)}
                        >
                            {index === 0 ? "-" :
                                <span style={{ fontFamily: "'Archivo Narrow', sans-serif", fontWeight: "bold", fontSize: "20px", color: "#ffd84d" }}>
                                    {"+".repeat(index)}
                                </span>
                            }
                        </div>
                    )}
                </div> :
                <span style={{ color: giftTagColors.enhanceable }}>Enhanceable</span>
        ) : null}

        {gift.ingredientOf ? <span style={{ color: giftTagColors.ingredient }}>Ingredient</span> : null}
        {gift.fusion ? <span style={{ color: giftTagColors.fusion }}>Fusion Only</span> : null}
        {gift.hardonly ? <span style={{ color: giftTagColors.hardonly }}>Hard Only</span> : null}
        {gift.events ? <span style={{ color: giftTagColors.eventreward }}>Event Reward</span> : null}
        {gift.hidden ? <span style={{ color: giftTagColors.hidden }}>Hidden</span> : null}

        {gift.cursedPair ? (
            full ?
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span><span style={{ color: giftTagColors.blessed }}>Blessed</span> Pair</span>
                    <Gift id={gift.cursedPair} includeTooltip={true} expandable={true} />
                </div> :
                <span style={{ color: giftTagColors.cursed }}>Cursed</span>
        ) : null}

        {gift.blessedPair ? (
            full ?
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span><span style={{ color: giftTagColors.cursed }}>Cursed</span> Pair</span>
                    <Gift id={gift.blessedPair} includeTooltip={true} expandable={true} />
                </div> :
                <span style={{ color: giftTagColors.blessed }}>Blessed</span>
        ) : null}

    </React.Fragment>
}

export function GiftTagFilterSelector({ tagFilter, setTagFilter }) {
    const options = [
        { value: "Enhanceable", label: <span style={{ color: giftTagColors.enhanceable }}>Enhanceable</span> },
        { value: "Ingredient", label: <span style={{ color: giftTagColors.ingredient }}>Ingredient</span> },
        { value: "Fusion Only", label: <span style={{ color: giftTagColors.fusion }}>Fusion Only</span> },
        { value: "Hard Only", label: <span style={{ color: giftTagColors.hardonly }}>Hard Only</span> },
        { value: "Event Reward", label: <span style={{ color: giftTagColors.eventreward }}>Event Reward</span> },
        { value: "Hidden", label: <span style={{ color: giftTagColors.hidden }}>Hidden</span> },
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