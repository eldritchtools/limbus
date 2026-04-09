"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";

import TooltipTemplate from "./TooltipTemplate";

const tooltipContent = {
    "teamcode": "Limbus Company allows quickly copying teams using team codes. This feature can be found beside the team name in the sinner selection menu.",
    "additionalDetails": "Show optional inputs per sinner such as level, uptie, and notes.",
    "descSearch": "Only matches exact words within the description (excludes status descriptions). Filters out descriptions with no words matching any search words. Use \"search match score\" sorting to sort results based on relevancy (descending is most relevant first).",
    "groupedComp": "Combines all relevant skills/passives. Filters will pass if at least one skill/passive meets all of them. Sorting is based on the sum of the value across all skills/passives. When disabled, skills/passives are filtered and sorted independently from each other.",
    "includeExclude": "Included items follow the \"Strict Filtering\" setting.\nExcluded items require all of them to be excluded from the results.",
    "twiceToExclude": "Select twice to exclude.",
    "allIdEgoMenu": "Show a menu containing all identities or E.G.Os for faster selection."
}

const TOOLTIP_ID = "general-tooltip";

function GeneralTooltipContent({ content }) {
    const { isMobile } = useBreakpoint();
    return <div style={{ padding: "0.5rem", display: "block", maxWidth: isMobile ? "40ch" : "60ch", whiteSpace: "pre-wrap" }}>
        {tooltipContent[content] ?? content}
    </div>
}

export default function GeneralTooltip() {
    return <TooltipTemplate id={TOOLTIP_ID} contentFunc={content => <GeneralTooltipContent content={content} />} />
}

export function getGeneralTooltipProps(content) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": content
    }
}