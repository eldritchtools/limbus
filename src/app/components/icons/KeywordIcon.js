import { ASSETS_ROOT } from "@/app/paths";
import Image from "next/image";

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

export default function KeywordIcon({ id, size = 32 }) {
    return <Image
        src={`${ASSETS_ROOT}/icons/${caseMapping[id] ?? id}.png`}
        alt={id} title={id} style={{ width: `${size}px`, height: `${size}px` }}
    />;
}