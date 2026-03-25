"use client";

import Image from "next/image";

import { ASSETS_ROOT } from "@/app/paths";

const caseMapping = {
    "burn": "Burn",
    "bleed": "Bleed",
    "tremor": "Tremor",
    "rupture": "Rupture",
    "sinking": "Sinking",
    "poise": "Poise",
    "charge": "Charge",
    "slash": "Slash",
    "pierce": "Pierce",
    "blunt": "Blunt",
    "guard": "Guard",
    "evade": "Evade",
    "counter": "Counter",
    "Wrath": "wrath",
    "Lust": "lust",
    "Sloth": "sloth",
    "Gluttony": "gluttony",
    "Gloom": "gloom",
    "Pride": "pride",
    "Envy": "envy"
}

export function isValidKeywordId(id) {
    return Object.entries(caseMapping).some(([k, v]) => id === k || id === v);
}

export default function KeywordIcon({ id, size = 32, style = {} }) {
    return <Image
        src={`${ASSETS_ROOT}/icons/${caseMapping[id] ?? id}.png`}
        alt={id} title={id} 
        width={size} height={size} 
        style={{ width: `${size}px`, height: `${size}px`, ...style }}
    />;
}