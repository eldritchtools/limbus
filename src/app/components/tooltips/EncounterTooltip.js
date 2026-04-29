"use client";

import { isTouchDevice } from "@eldritchtools/shared-components";

import TooltipTemplate from "./TooltipTemplate";
import { useData } from "../DataProvider";
import EnemyIcon from "../icons/EnemyIcon";
import NoPrefetchLink from "../NoPrefetchLink";

import { encounterCategoryLabels } from "@/app/lib/encounters";

const TOOLTIP_ID = "encounter-tooltip";

function EncounterTooltipContent({ cat, id, encounter }) {
    const handleTargets = (acc, targets) => {
        acc.push(...targets);
    }

    const handlePhase = (acc, phase) => {
        handleTargets(acc, phase.targets);
    }

    const handleWave = (acc, wave) => {
        if("phases" in wave) wave.phases.forEach(phase => handlePhase(acc, phase));
        else handleTargets(acc, wave.targets);
    }
    
    const handleEncounter = (acc, encounter) => {
        if("waves" in encounter) encounter.waves.forEach(wave => handleWave(acc, wave));
        else if("phases" in encounter) encounter.phases.forEach(phase => handlePhase(acc, phase));
        else handleTargets(acc, encounter.targets);
        return acc;
    }

    const targets = handleEncounter([], encounter).map((x, i) =>
        <div key={i} style={{ width: "75px", height: "150px", border: "1px #aaa solid" }} onClick={() => setTargetIndex(i)}>
            <EnemyIcon id={x.portrait} style={{ width: "100%", height: "100%" }} />
        </div>
    );

    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", alignItems: "center", maxWidth: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", fontSize: "1rem", fontWeight: "bold" }}>
            <span>{encounterCategoryLabels[cat]}: {encounter.name}</span>
        </div>
        <div style={{ display: "flex", gap: "0.2rem", maxWidth: "100%" }}>
            {targets}
        </div>
        {isTouchDevice() ? <NoPrefetchLink href={`/encounters?category=${cat}&encounter=${id}`} style={{ alignSelf: "center", fontSize: "1.2rem" }}>Go to page</NoPrefetchLink> : null}
    </div>;
}

function TooltipLoader({ cat, id }) {
    const [encounter, encounterLoading] = useData(`encounters/${cat}/${id}`);
    if (!cat || !id || encounterLoading) return null;

    return <EncounterTooltipContent cat={cat} id={id} encounter={encounter} />
}

export default function EncounterTooltip() {
    return <TooltipTemplate id={TOOLTIP_ID} contentFunc={str => {
        if(!str) return; 
        const [cat, id] = str.split("|");
        return <TooltipLoader cat={cat} id={id} />
    }} clickable={isTouchDevice()} />
}

export function getEncounterTooltipProps(cat, id) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": `${cat}|${id}`
    }
}