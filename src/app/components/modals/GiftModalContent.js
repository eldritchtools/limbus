"use client";

import { useState } from "react";

import { useFloorsForPack } from "../dataHooks/mdFloors";
import ThemePackIcon from "../icons/ThemePackIcon";
import FusionRecipe from "../objects/FusionRecipe";
import Gift from "../objects/Gift";
import ProcessedText from "../texts/ProcessedText";

import { affinityColorMapping, giftTagColors } from "@/app/lib/colors";

const buttonStyle = { border: "1px #aaa solid", padding: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transiton: "background-color 0.2s, border-color 0.2s" };
const iconTextStyle = { fontFamily: "'Archivo Narrow', sans-serif", fontWeight: "bold", fontSize: "20px", color: "#ffd84d" };

function ThemePackWithFloors({ id }) {
    const { normal, hard } = useFloorsForPack(id);
    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
        <ThemePackIcon id={id} displayName={true} scale={0.5} />
        <div style={{ display: "grid", width: "190px", gridTemplateColumns: "1fr 1fr" }} >
            <div style={{ color: "#4ade80" }}>Normal</div>
            <div style={{ color: "#f87171" }}>Hard</div>
            <div>{normal.length ? normal.map(f => `F${f}`).join(", ") : "None"}</div>
            <div>{hard.length ? hard.map(f => `F${f}`).join(", ") : "None"}</div>
        </div>
    </div>
}

export default function GiftModalContent({ gift, enhanceRank }) {
    const [enhanceLevel, setEnhanceLevel] = useState(enhanceRank);
    let level = Math.min(enhanceLevel, gift.descs.length - 1);

    return <div style={{ display: "grid", gridTemplateRows: "auto 1fr", width: "100%", gap: "0.5rem", maxHeight: "80vh", overflow: "hidden" }}>
        <div style={{ fontSize: "1.25rem", fontWeight: "bold", textAlign: "start", color: affinityColorMapping[gift.affinity] }}>
            {gift.names[level]}
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", minHeight: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", flex: "0 0 auto" }}>
                <div>
                    <Gift gift={gift} includeTooltip={false} enhanceRank={enhanceLevel} expandable={false} />
                </div>
                {gift.enhanceable ? <div style={{ display: "grid", gridTemplateColumns: `repeat(${gift.names.length}, 2rem)` }}>
                    {Array.from({ length: gift.names.length }, (_, index) =>
                        <div key={index}
                            style={{ ...buttonStyle, backgroundColor: enhanceLevel === index ? "#3f3f3f" : "#1f1f1f" }}
                            onClick={() => setEnhanceLevel(index)}
                        >
                            {index === 0 ? "-" : <span style={iconTextStyle}>{"+".repeat(index)}</span>}
                        </div>
                    )}
                </div> : null
                }
                {gift.ingredientOf ? <span style={{ color: giftTagColors.ingredient }}>Ingredient</span> : null}
                {gift.fusion ? <span style={{ color: giftTagColors.fusion }}>Fusion Only</span> : null}
                {gift.hardonly ? <span style={{ color: giftTagColors.hardonly }}>Hard Only</span> : null}
                {gift.cursedPair ?
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <span><span style={{ color: giftTagColors.blessed }}>Blessed</span> Pair</span>
                        <Gift id={gift.cursedPair} includeTooltip={true} expandable={true} />
                    </div> : null}
                {gift.blessedPair ?
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <span><span style={{ color: giftTagColors.cursed }}>Cursed</span> Pair</span>
                        <Gift id={gift.blessedPair} includeTooltip={true} expandable={true} />
                    </div> : null}
            </div>
            <div style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "inline-block", fontSize: "1rem", lineHeight: "1.5", textWrap: "wrap", whiteSpace: "pre-wrap", textAlign: "start" }}>
                        <ProcessedText text={gift.descs[level]} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "1rem" }}>
                        {
                            gift.exclusiveTo ?
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: "1.25rem", fontWeight: "bold", textAlign: "start" }}>Exclusive Theme Packs</span>
                                    <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", maxWidth: "calc(100vw - 100px)", overflowX: "auto" }}>
                                        {gift.exclusiveTo.map(packId => <ThemePackWithFloors key={packId} id={packId} />)}
                                    </div>
                                </div> : null
                        }
                        {
                            gift.recipes || gift.ingredientOf ?
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    {gift.recipes ? <>
                                        <span style={{ fontSize: "1.25rem", fontWeight: "bold", textAlign: "start" }}>Fusion Recipes</span>
                                        <div style={{ overflowX: "auto", overflowY: "hidden" }}>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                {gift.recipes.map((recipe, i) => <FusionRecipe key={i} recipe={{ ingredients: recipe }} includeProduct={false} />)}
                                            </div>
                                        </div>
                                    </> : null}
                                    {gift.ingredientOf ? <>
                                        <span style={{ fontSize: "1.25rem", fontWeight: "bold", textAlign: "start" }}>Ingredient of</span>
                                        <div style={{ overflowX: "auto", overflowY: "hidden" }}>
                                            <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>
                                                {gift.ingredientOf.map(giftId => <Gift key={giftId} id={giftId} includeTooltip={true} expandable={true} />)}
                                            </div>
                                        </div>
                                    </> : null}
                                </div> : null
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>
}