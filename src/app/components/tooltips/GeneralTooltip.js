"use client";

import styles from "./Tooltip.module.css";
import TooltipTemplate from "./TooltipTemplate";


const tooltipContent = {
    "teamcode": "Limbus Company allows quickly copying teams using team codes. This feature can be found beside the team name in the sinner selection menu. When editing a team build, you can paste a team code here to edit your build.",
    "additionalDetails": "Show optional inputs per sinner such as level, uptie, and notes.\nIt's not recommended to set levels and uptie unless they are necessary for the build.",
    "descSearch": "Only matches exact words within the description (excludes status descriptions). Filters out descriptions with no words matching any search words. Use \"search match score\" sorting to sort results based on relevancy (descending is most relevant first).",
    "groupedComp": "Combines all relevant skills/passives. Filters will pass if at least one skill/passive meets all of them. Sorting is based on the sum of the value across all skills/passives. When disabled, skills/passives are filtered and sorted independently from each other.",
    "includeExclude": "Included items follow the \"Strict Filtering\" setting.\nExcluded items require all of them to be excluded from the results.",
    "twiceToExclude": "Select twice to exclude.",
    "allIdEgoMenu": "Show a menu containing all identities or E.G.Os for faster selection."
}

export const GENERAL_TOOLTIP_ID = "general-tooltip";

function GeneralTooltipContent({ content }) {
    return <div className={styles.generalTooltip}>
        {tooltipContent[content] ?? content}
    </div>
}

export default function GeneralTooltip() {
    return <TooltipTemplate id={GENERAL_TOOLTIP_ID} contentFunc={content => <GeneralTooltipContent content={content} />} />
}

export function getGeneralTooltipProps(content) {
    return {
        "data-tooltip-id": GENERAL_TOOLTIP_ID,
        "data-tooltip-content": content
    }
}