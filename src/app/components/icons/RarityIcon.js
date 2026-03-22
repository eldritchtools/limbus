import { ASSETS_ROOT } from "@/app/paths";

const mapping = { 1: "0", 2: "00", 3: "000" }

export default function RarityIcon({ rarity, style = {}, alt = false }) {
    const label = mapping[rarity] ?? rarity;
    const fileName = `${label}${alt ? "-letter" : ""}`;
    const src = `${ASSETS_ROOT}/icons/${fileName}.png`
    const finalStyle = { height: "2rem", ...style };

    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={label} title={label} style={finalStyle} />
}