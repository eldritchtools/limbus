/* eslint-disable @next/next/no-img-element */

// import Image from "next/image";

import styles from "./Icon.module.css";
import RarityIcon from "./RarityIcon";
import TierIcon from "./TierIcon";
import DataLoader from "../DataLoader";
import { getIdentityTooltipProps } from "../tooltips/TooltipProps";

import { ASSETS_ROOT } from "@/app/paths";

export function getIdentityImgSrc(identity, uptie = 4, swapIcon) {
    if (identity.upcoming) return `${ASSETS_ROOT}/${identity.src}.png`;

    if (identity.tags.includes("Base Identity"))
        return `${ASSETS_ROOT}/identities/${identity.id}_gacksung_profile.webp`;

    let type = uptie > 2 ? "gacksung" : "normal";
    if (swapIcon) {
        if (type === "gacksung") type = "normal";
        else if (type === "normal") type = "gacksung";
    }

    return `${ASSETS_ROOT}/identities/${identity.id}_${type}_profile.webp`;
}

function IdentityIconMain({ identity, style, uptie, displayName = false, displayRarity = false, displayUptie = false, includeTooltip = false, level = null, swapIcon, forceRatingsOnTooltip, lazyLoad = true }) {
    // const img = <Image src={getIdentityImgSrc(identity, uptie)} alt={identity.name} title={identity.name} width={192} height={192} style={{ ...style, objectFit: "cover" }} />
    const img = <img src={getIdentityImgSrc(identity, uptie, swapIcon)} alt={identity.name} title={identity.name} style={{ ...style, width: "100%", height: "100%", objectFit: "cover" }} loading={lazyLoad ? "lazy" : "eager"} />

    return <div className={styles.identityIconContainer} style={{ width: style.width }}
        {...(includeTooltip && !identity.upcoming ? getIdentityTooltipProps(identity.id, forceRatingsOnTooltip) : {})}
    >
        {img}
        {displayRarity ?
            (
                identity.upcoming ?
                    <div className={styles.upcomingLabel}>UPCOMING</div> :
                    <RarityIcon className={styles.identityRarityIcon} rarity={identity.rank} />
            ) :
            null
        }
        {displayName ?
            <div
                className={styles.identityIconName}
                style={{ fontSize: `clamp(0.6rem, calc(10cqw - (${identity.name.length} * 0.02px)), 1rem)` }}
            >
                {identity.name}
            </div> :
            null
        }
        {displayUptie || level ?
            <div className={styles.identityUptieIcon}>
                {displayUptie ? <TierIcon tier={uptie} scale={.9} /> : null}
                <span className={styles.identityIconOpts}>{level ? `Lv.${level}` : null}</span>
            </div> :
            null
        }
    </div>
}

export default function IdentityIcon({ id, identity = null, scale, size, width, style = {}, ...props }) {
    const newStyle = width ?
        { width: width, height: "auto", ...style } :
        size ?
            { width: `${size}px`, height: `${size}px`, ...style } :
            scale ?
                { width: `${256 * scale}px`, height: `${256 * scale}px`, ...style } :
                { width: "100%", height: "auto", ...style };

    if (identity) {
        return <IdentityIconMain identity={identity} style={newStyle} {...props} />
    } else {
        return <DataLoader file="identities_mini" type="Identity" id={id} upcomingFallback="identities">
            {identity => <IdentityIconMain id={id} identity={identity} style={newStyle} {...props} />}
        </DataLoader>
    }
}
