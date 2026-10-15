import { ASSETS_ROOT } from "@/app/paths";

const typePaths = {
    "normal": "coin",
    "unbreakable": "unbreakable coin",
    "excision": "excision coin",
    "purple": "purple coin"
}

export default function CoinIcon({ className, coin, style }) {
    const path = typePaths[coin.type];
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={`${ASSETS_ROOT}/icons/${path}.webp`} alt={path} title={path} style={style} />
}