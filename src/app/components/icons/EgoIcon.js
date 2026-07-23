/* eslint-disable @next/next/no-img-element */

// import Image from "next/image";

import styles from "./Icon.module.css";
import { getEgoImgSrc } from "./imgSrc";
import RarityIcon from "./RarityIcon";
import TierIcon from "./TierIcon";
import DataLoader from "../DataLoader";
import { getEgoTooltipProps } from "../tooltips/TooltipProps";

import { affinityColorMapping } from "@/app/lib/colors";

function EgoIconMain({ ego, style, type, banner = false, displayName = false, displayRarity = false, includeTooltip = false, threadspin = null, forceRatingsOnTooltip, lazyLoad = true }) {
    const src = getEgoImgSrc(ego, type);
    const { width, height } = style;

    // const img = <Image src={src} alt={ego.name} title={ego.name} fill sizes="auto" style={{ ...remStyle, objectFit: "cover" }} />
    const img = <img src={src} alt={ego.name} title={ego.name} style={{ ...style, width: "100%", height: "100%", objectFit: "cover" }} loading={lazyLoad ? "lazy" : "eager"} />

    return <div className={styles.egoIconContainer}
        style={{ width: width, height: height, aspectRatio: banner ? "4/1" : "1/1" }}
        {...(includeTooltip && !ego.upcoming ? getEgoTooltipProps(ego.id, forceRatingsOnTooltip) : {})}
    >
        {img}
        {displayRarity ?
            (
                ego.upcoming ?
                    <div className={styles.upcomingLabel}>
                        UPCOMING
                    </div> :
                    <RarityIcon className={styles.egoRarityIcon} rarity={ego.rank.toLowerCase()} />
            ) :
            null
        }
        {threadspin ? (
            banner ? <div className={styles.egoThreadspinIcon} >
                <TierIcon tier={threadspin} scale={.9} />
            </div> : <div className={styles.egoThreadspinIcon} style={{ top: "4px" }}>
                <TierIcon tier={threadspin} scale={.9} />
            </div>) :
            null
        }
        {displayName ? (
            banner ?
                <div
                    className={`${styles.egoIconName} ${styles.banner}`}
                    style={{ color: affinityColorMapping[ego?.affinity || ego?.awakeningType?.affinity || "none"] }}
                >
                    {ego.name}
                </div> :
                <div
                    className={`${styles.egoIconName} ${styles.standard}`}
                    style={{ fontSize: `clamp(0.6rem, calc(10cqw - (${ego.name.length} * 0.02px)), 1rem)` }}
                >
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
