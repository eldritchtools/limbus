import { affinityColorMapping, giftTagColors } from "@/app/lib/colors";
import { useData } from "../DataProvider";
import TooltipTemplate from "./TooltipTemplate";
import TextWithStatuses from "@/app/lib/statusReplacement";
import GiftIcon from "../icons/GiftIcon";

const tooltipDescStyle = { display: "inline-block", fontSize: "1rem", lineHeight: "1.5", textWrap: "wrap", whiteSpace: "pre-wrap" };
const TOOLTIP_ID = "gift-tooltip";

function GiftTooltipContent({ gift, enhanceRank = 0, expandable = true }) {
    const [themePacks, themePacksLoading] = useData("md_theme_packs");

    const exclusiveText = list => themePacksLoading ? null :
        <div style={{ display: "flex", flexDirection: "column" }}>
            <br />
            <span>Exclusive Theme Packs:</span>
            {list.map(themePackId => <span key={themePackId}>{themePacks[themePackId].name}</span>)}
        </div>

    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem" }}>
        <div style={{ marginBottom: "0.5rem", fontSize: "1.5rem", fontWeight: "bold", textAlign: "center", color: affinityColorMapping[gift.affinity] }}>
            {gift.names[enhanceRank]}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                <GiftIcon gift={gift} enhanceRank={enhanceRank} />
                {gift.enhanceable ? <span style={{ color: giftTagColors.enhanceable }}>Enhanceable</span> : null}
                {gift.ingredientOf ? <span style={{ color: giftTagColors.ingredient }}>Ingredient</span> : null}
                {gift.fusion ? <span style={{ color: giftTagColors.fusion }}>Fusion Only</span> : null}
                {gift.hardonly ? <span style={{ color: giftTagColors.hardonly }}>Hard Only</span> : null}
                {gift.cursedPair ? <span style={{ color: giftTagColors.cursed }}>Cursed</span> : null}
                {gift.blessedPair ? <span style={{ color: giftTagColors.blessed }}>Blessed</span> : null}
            </div>
            <div style={{ ...tooltipDescStyle, display: "flex", flexDirection: "column", textAlign: "left" }}>
                <TextWithStatuses templateText={gift.descs[enhanceRank]} />
                {gift.exclusiveTo ? exclusiveText(gift.exclusiveTo) : null}
            </div>
        </div>
        {expandable ?
            <div style={{ borderTop: "1px #444 dashed", fontSize: "0.8rem", color: "#999", textAlign: "center" }}>
                Click gift to expand
            </div> :
            null
        }
    </div>
}

function TooltipLoader({ giftId, enhanceRank, expandable }) {
    const [gifts, giftsLoading] = useData("gifts");
    if (!giftId || giftsLoading) return null;

    return <GiftTooltipContent gift={gifts[giftId]} enhanceRank={enhanceRank} expandable={expandable} />
}

export default function GiftTooltip() {
    return <TooltipTemplate id={TOOLTIP_ID} contentFunc={content => {
        if (!content) return null;
        const [id, rank, expandable] = content.split(":");
        return <TooltipLoader giftId={id} enhanceRank={Number(rank)} expandable={expandable === "true"} />
    }} />
}

export function getGiftTooltipProps(id, enhanceRank, expandable) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": `${id}:${enhanceRank}:${expandable}`
    }
}