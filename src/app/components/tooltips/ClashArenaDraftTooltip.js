"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";

import TooltipTemplate from "./TooltipTemplate";
import EgoIcon from "../icons/EgoIcon";
import IdentityIcon from "../icons/IdentityIcon";

export const CLASH_ARENA_DRAFT_TOOLTIP_ID = "clash-arena-draft-tooltip";

function ClashArenaDraftTooltipContent({ ids }) {
    const { isMobile } = useBreakpoint();
    return <div style={{ display: "flex", padding: "0.5rem" }}>
        {ids.map(id =>
            id[0] === '1' ?
                <IdentityIcon key={id} id={id} displayName={true} displayRarity={true} size={isMobile ? 92 : 128} /> :
                <EgoIcon key={id} id={id} type="awaken" displayName={true} displayRarity={true} size={isMobile ? 92 : 128} />
        )}
    </div>
}

export default function ClashArenaDraftTooltip() {
    return <TooltipTemplate
        id={CLASH_ARENA_DRAFT_TOOLTIP_ID}
        contentFunc={content => {
            if (!content) return;
            const ids = content.split(",");
            return <ClashArenaDraftTooltipContent ids={ids} />
        }}
    />
}

export function getClashArenaDraftTooltipProps(ids) {
    const content = ids.filter(x => x).join(",");
    return {
        "data-tooltip-id": CLASH_ARENA_DRAFT_TOOLTIP_ID,
        "data-tooltip-content": content
    }
}