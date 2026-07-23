"use client";

import TooltipTemplate from "./TooltipTemplate";
import KeywordIcon from "../icons/KeywordIcon";

import { capitalizeFirstLetter } from "@/app/lib/uiStrings";

export const DISTRIBUTION_TOOLTIP_ID = "distribution-tooltip";

function DistributionTooltipContent({ content }) {
    const [id, active, backup, inactive] = content.split("|");

    const div = ["guard", "evade", "counter"].includes(id) ? 6 : 1

    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
            <KeywordIcon id={id} size={32} />
            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                {capitalizeFirstLetter(id)}
            </span>
        </div>
        <span>Active: {active / div}</span>
        <span>Backup: {backup / div}</span>
    </div>
}

export default function DistributionTooltip() {
    return <TooltipTemplate id={DISTRIBUTION_TOOLTIP_ID} contentFunc={content => <DistributionTooltipContent content={content} />} />
}

export function getDistributionTooltipProps(id, active, backup, inactive) {
    return {
        "data-tooltip-id": DISTRIBUTION_TOOLTIP_ID,
        "data-tooltip-content": `${id}|${active}|${backup}|${inactive}`
    }
}