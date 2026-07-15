/* eslint-disable @next/next/no-img-element */

// import Image from "next/image";

import { getEgoImgSrc } from "./imgSrc";
import RarityIcon from "./RarityIcon";
import TierIcon from "./TierIcon";
import DataLoader from "../DataLoader";
import { getEgoTooltipProps } from "../tooltips/TooltipProps";

import { affinityColorMapping } from "@/app/lib/colors";

const rarityStyle = { position: "absolute", top: "4px", left: "4px", height: "1.5rem", objectFit: "contain", pointerEvents: "none" };
const threadspinStyle = { position: "absolute", textAlign: "right", textShadow: "0 0 4px #000, 0 0 12px #000, 2px 2px 4px #000, -2px -2px 4px #000" };
const nameStyle = { position: "absolute", overflow: "hidden", textWrap: "balance", fontWeight: "bold", textShadow: "0 0 4px #000, 0 0 12px #000, 2px 2px 8px #000, -2px -2px 8px #000" }

function EgoIconMain({ ego, style, type, banner = false, displayName = false, displayRarity = false, includeTooltip = false, threadspin = null, forceRatingsOnTooltip, lazyLoad = true }) {
    const src = getEgoImgSrc(ego, type);
    const { width, height } = style;

    // const img = <Image src={src} alt={ego.name} title={ego.name} fill sizes="auto" style={{ ...remStyle, objectFit: "cover" }} />
    const img = <img src={src} alt={ego.name} title={ego.name} style={{ ...style, width: "100%", height: "100%", objectFit: "cover" }} loading={lazyLoad ? "lazy" : "eager"} />

    return <div
        style={{
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            width: width, height: height, aspectRatio: banner ? "4/1" : "1/1", containerType: "size"
        }}
        {...(includeTooltip && !ego.upcoming ? getEgoTooltipProps(ego.id, forceRatingsOnTooltip) : {})}
    >
        {img}
        {displayRarity ?
            (
                ego.upcoming ?
                    <div style={{
                        ...nameStyle, left: "4px", top: "4px", display: "block", textAlign: "left", color: "#ddd", fontSize: "0.9rem", overflow: "hidden"
                    }}>
                        UPCOMING
                    </div> :
                    <RarityIcon rarity={ego.rank.toLowerCase()} style={rarityStyle} />
            ) :
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
                color: affinityColorMapping[ego?.affinity || ego?.awakeningType?.affinity || "none"]
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
        return <DataLoader file="egos_mini" type="Ego" id={id} upcomingFallback="egos">
            {ego => <EgoIconMain id={id} ego={ego} style={newStyle} {...props} />}
        </DataLoader>
    }
}
