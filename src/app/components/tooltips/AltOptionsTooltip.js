"use client";

import { isTouchDevice } from "@eldritchtools/shared-components";

import TooltipTemplate from "./TooltipTemplate";
import EgoIcon from "../icons/EgoIcon";
import IdentityIcon from "../icons/IdentityIcon";

const TOOLTIP_ID = "alt-options-tooltip";

function AltOptionsTooltipContent({ ids }) {
    const alts = ids.split(",");

    return <div style={{display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center", padding: "0.5rem"}}>
        <span>Alternative options for this sinner.</span>
        <span>Click for additional details.</span>
        <div style={{display: "flex"}}>
            {alts.map(x => x[0] === '1' ?
                <IdentityIcon key={x} id={x} displayName={true} displayRarity={true} width={92}/> :
                <EgoIcon key={x} id={x} type="awaken" displayName={true} displayRarity={true} width={92}/>
            )}
        </div>
    </div>
}

export default function AltOptionsTooltip() {
    return <TooltipTemplate id={TOOLTIP_ID}
        contentFunc={content => <AltOptionsTooltipContent ids={content} />}
        clickable={isTouchDevice()}
    />
}

export function getAltOptionsTooltipProps(ids) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": ids.join(","),
    }
}