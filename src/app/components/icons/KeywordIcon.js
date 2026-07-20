/* eslint-disable @next/next/no-img-element */

// import Image from "next/image";

import styles from "./Icon.module.css";

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

export function getKeywordImgSrc(id) {
    return `${ASSETS_ROOT}/icons/${caseMapping[id] ?? id}.webp`;
}

export default function KeywordIcon({ id, className, size, style = {} }) {
    // return <Image
    //     src={`${ASSETS_ROOT}/icons/${caseMapping[id] ?? id}.png`}
    //     alt={id} title={id} 
    //     width={size} height={size} 
    //     style={{ width: `${size}px`, height: `${size}px`, ...style }}
    // />;
    
    const finalStyle = size ? { width: `${size}px`, height: `${size}px`, ...style } : style

    return <img
        className={className ?? styles.iconSize32}
        src={getKeywordImgSrc(id)}
        alt={id} title={id}
        style={finalStyle}
        loading="lazy"
    />;
}