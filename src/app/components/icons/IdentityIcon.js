import { useData } from "../DataProvider";
import TierIcon from "./TierIcon";
import RarityIcon from "./RarityIcon";
import Image from "next/image";
import { ASSETS_ROOT } from "@/app/paths";

export function getIdentityImgSrc(identity, uptie = 4) {
    const type = (uptie > 2 || identity.tags.includes("Base Identity")) ? "gacksung" : "normal";
    return `${ASSETS_ROOT}/identities/${identity.id}_${type}_profile.png`;
}

function IdentityIconMain({ identity, style, uptie, displayName = false, displayRarity = false, displayUptie = false, level = null }) {
    const img = <Image src={getIdentityImgSrc(identity, uptie)} alt={identity.name} title={identity.name} style={{ ...style, objectFit: "cover" }} />

    return <div style={{ position: "relative", width: style.width, aspectRatio: "1/1", containerType: "size" }}>
        {img}
        {displayRarity ?
            <RarityIcon rarity={identity.rank} style={{ position: "absolute", top: "4px", left: "4px", height: "2rem", objectFit: "contain", pointerEvents: "none" }} /> :
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

function IdentityIconFetch({ id, style, ...props }) {
    const [identities, identitiesLoading] = useData("identities_mini");

    if (identitiesLoading) {
        return null;
    } else if (!(id in identities)) {
        console.warn(`Identity ${id} not found.`);
        return null;
    } else {
        return <IdentityIconMain identity={identities[id]} style={style} {...props} />
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
