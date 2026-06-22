"use client";

import { isTouchDevice } from "@eldritchtools/shared-components";
import { useMemo } from "react";

import TooltipTemplate from "./TooltipTemplate";
import BuildIdentitiesGrid from "../build/BuildIdentitiesGrid";

import { parseTeamCode } from "@/app/lib/teamCodeEncoding";

const TOOLTIP_ID = "teamcode-tooltip";

function TeamCodeTooltipContent({ code }) {
    const buildData = useMemo(() => {
        return parseTeamCode(code);
    }, [code]);

    if(!buildData) return <div style={{padding: "0.5rem"}}>Invalid Team Code</div>;

    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem" }}>
        <BuildIdentitiesGrid identityIds={buildData.identities} scale={.33} deploymentOrder={buildData.deploymentOrder} activeSinners={12}/>
    </div>
}

export default function TeamCodeTooltip() {
    return <TooltipTemplate id={TOOLTIP_ID}
        contentFunc={content => <TeamCodeTooltipContent code={content} />}
        clickable={isTouchDevice()}
    />
}

export function getTeamCodeTooltipProps(code) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": code,
    }
}