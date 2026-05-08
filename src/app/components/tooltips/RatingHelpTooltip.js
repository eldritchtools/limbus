"use client";

import TooltipTemplate from "./TooltipTemplate";

import { egoCriteria, identityCriteria } from "@/app/lib/ratings";

const TOOLTIP_ID = "rating-help-tooltip";

function RatingHelpTooltipContent({ type }) {
    const text = useMemo(() => {
        const criteria = type === "identity" ? identityCriteria: egoCriteria;
        return criteria.map(({label, desc}) => `${label}: ${desc}`).join("\n\n");
    }, [type]);
    
    return <div style={{padding: "0.5rem", whiteSpace: "pre-wrap"}}>
        <span>{text}</span>
    </div>;
}

export default function RatingHelpTooltip() {
    return <TooltipTemplate id={TOOLTIP_ID} contentFunc={type => <RatingHelpTooltipContent type={type} />} />
}

export function getRatingHelpTooltipProps(type) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": type
    }
}