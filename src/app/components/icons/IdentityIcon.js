/* eslint-disable @next/next/no-img-element */
"use client";

// import Image from "next/image";

import { useData } from "../DataProvider";
import RarityIcon from "./RarityIcon";
import TierIcon from "./TierIcon";
import { getIdentityTooltipProps } from "../tooltips/IdentityTooltip";

import { ASSETS_ROOT } from "@/app/paths";

export function getIdentityImgSrc(identity, uptie = 4) {
    if (identity.upcoming) return `${ASSETS_ROOT}/${identity.src}.png`;

    const type = (uptie > 2 || identity.tags.includes("Base Identity")) ? "gacksung" : "normal";
    return `${ASSETS_ROOT}/identities/${identity.id}_${type}_profile.png`;
}

function IdentityIconMain({ identity, style, uptie, displayName = false, displayRarity = false, displayUptie = false, includeTooltip = false, level = null }) {
    // const img = <Image src={getIdentityImgSrc(identity, uptie)} alt={identity.name} title={identity.name} width={192} height={192} style={{ ...style, objectFit: "cover" }} />
    const img = <img src={getIdentityImgSrc(identity, uptie)} alt={identity.name} title={identity.name} style={{ ...style, objectFit: "cover" }} />

    return <div
        style={{ position: "relative", width: style.width, aspectRatio: "1/1", containerType: "size" }}
        {...(includeTooltip ? getIdentityTooltipProps(identity.id) : {})}
    >
        {img}
        {displayRarity ?
            (
                identity.upcoming ?
                    <div style={{
                        position: "absolute", top: "4px", left: "4px", display: "block", textAlign: "left", color: "#ddd", fontWeight: "600",
                        textShadow: "0 0 4px #000, 0 0 12px #000, 2px 2px 4px #000, -2px -2px 4px #000", fontSize: "0.9rem", overflow: "hidden"
                    }}>
                        UPCOMING
                    </div> :
                    <RarityIcon rarity={identity.rank} style={{ position: "absolute", top: "4px", left: "4px", height: "2rem", objectFit: "contain", pointerEvents: "none" }} />
            ) :
            null}
        {displayName ? <div style={{
            position: "absolute", bottom: "4px", right: "4px", maxWidth: "100%", maxHeight: "70%", overflow: "hidden",
            display: "block", textAlign: "right", color: "#ddd", fontWeight: "600", lineHeight: "1.1", textWrap: "balance",
            textShadow: "0 0 4px #000, 0 0 12px #000, 2px 2px 4px #000, -2px -2px 4px #000",
            fontSize: `clamp(0.6rem, calc(10cqw - (${identity.name.length} * 0.02px)), 1rem)`
        }}>
            {identity.name}
        </div> : null}
        {displayUptie || level ? <div style={{
            position: "absolute", top: "4px", right: "4px", display: "flex", flexDirection: "column", textAlign: "right",
            textShadow: "0 0 4px #000, 0 0 12px #000, 2px 2px 4px #000, -2px -2px 4px #000"
        }}>
            {displayUptie ? <TierIcon tier={uptie} scale={.9} /> : null}
            <span style={{ color: "#ddd", fontWeight: "600", lineHeight: "1.1", fontSize: `1rem` }}>{level ? `Lv.${level}` : null}</span>
        </div> : null}
    </div>
}

function IdentityUpcomingFetch({ id, ...props }) {
    const [upcoming, upcomingLoading] = useData("upcoming");

    if (upcomingLoading) {
        return null;
    } else if (!(id in upcoming?.identities)) {
        return null;
    } else {
        return <IdentityIconMain identity={upcoming.identities[id]} {...props} />
    }
}

function IdentityIconFetch({ id, ...props }) {
    const [identities, identitiesLoading] = useData("identities_mini");

    if (identitiesLoading) {
        return null;
    } else if (!(id in identities)) {
        console.warn(`Identity ${id} not found.`);
        return <IdentityUpcomingFetch id={id} {...props} />;
    } else {
        return <IdentityIconMain identity={identities[id]} {...props} />
    }
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
        return <IdentityIconFetch id={id} style={newStyle} {...props} />
    }
}
