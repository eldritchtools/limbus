import { useData } from "../DataProvider";
import { affinityColorMapping } from "@/app/lib/colors";
import { ASSETS_ROOT } from "@/app/paths";
import TierIcon from "./TierIcon";
import RarityIcon from "./RarityIcon";
import Image from "next/image";

export function getEgoImgSrc(ego, type) {
    return `${ASSETS_ROOT}/egos/${ego.id}_${type}_profile.png`;
}

const rarityStyle = { position: "absolute", top: "4px", left: "4px", height: "1.5rem", objectFit: "contain", pointerEvents: "none" };
const threadspinStyle = { position: "absolute", textAlign: "right", textShadow: "0 0 4px #000, 0 0 12px #000, 2px 2px 4px #000, -2px -2px 4px #000" };
const nameStyle = { position: "absolute", overflow: "hidden", textWrap: "balance", fontWeight: "bold", textShadow: "0 0 4px #000, 0 0 12px #000, 2px 2px 8px #000, -2px -2px 8px #000" }

function EgoIconMain({ ego, style, type, banner = false, displayName = false, displayRarity = false, threadspin = null }) {
    const src = getEgoImgSrc(ego, type);

    const newStyle = { ...style, aspectRatio: banner ? "4/1" : "1/1", height: null, objectFit: "cover" };
    const img = <Image src={src} alt={ego.name} title={ego.name} style={newStyle} />

    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", width: newStyle.width, aspectRatio: newStyle.aspectRatio, containerType: "size" }}>
        {img}
        {displayRarity ?
            <RarityIcon rarity={ego.rank.toLowerCase()} style={rarityStyle} /> :
            null
        }
        {threadspin ? (
            banner ? <div style={{ ...threadspinStyle, right: "4px" }}>
                <TierIcon tier={threadspin} scale={.9} />
            </div> : <div style={{ ...threadspinStyle, top: "4px", right: "4px" }}>
                <TierIcon tier={threadspin} scale={.9} />
            </div>) :
            null
        }
        {displayName ? (
            banner ? <div style={{
                ...nameStyle, fontSize: "0.75rem", maxHeight: "100%", textAlign: "center",
                color: affinityColorMapping[ego.affinity || ego.awakeningType.affinity]
            }}>
                {ego.name}
            </div> : <div style={{
                ...nameStyle, bottom: "4px", right: "4px", maxWidth: "100%", maxHeight: "70%", display: "block", textAlign: "right",
                color: "#ddd", lineHeight: "1.1", fontSize: `clamp(0.6rem, calc(10cqw - (${ego.name.length} * 0.02px)), 1rem)`
            }}>
                {ego.name}
            </div>) :
            null
        }
    </div>
}

function EgoIconFetch({ id, style, ...props }) {
    const [egos, egosLoading] = useData("egos_mini");
    if (egosLoading) {
        return null;
    } else if (!(id in egos)) {
        console.warn(`Ego ${id} not found.`);
        return null;
    } else {
        return <EgoIconMain ego={egos[id]} style={style} {...props} />
    }

}

export default function EgoIcon({ id, ego = null, scale, size, width, style = {}, ...props }) {
    const newStyle = width ?
        { width: width, height: "auto", ...style } :
        size ?
            { width: `${size}px`, height: `${size}px`, ...style } :
            scale ?
                { width: `${256 * scale}px`, height: `${256 * scale}px`, ...style } :
                { width: "100%", height: "auto", ...style };

    if (ego) {
        return <EgoIconMain ego={ego} style={newStyle} {...props} />
    } else {
        return <EgoIconFetch id={id} style={newStyle} {...props} />
    }
}
