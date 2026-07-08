/* eslint-disable @next/next/no-img-element */
"use client";

import { useData } from "../DataProvider";

import { ASSETS_ROOT } from "@/app/paths";

export function getIdentityArtSrc(identityId, uptie) {
    if (String(identityId).slice(-2) === "01")
        return `${ASSETS_ROOT}/identities/${identityId}_normal.png`;

    return `${ASSETS_ROOT}/identities/${identityId}_${uptie ? "gacksung" : "normal"}.png`;
}

function getSrc(identity, uptie) {
    if (identity.tags.includes("Base Identity"))
        return `${ASSETS_ROOT}/identities/${identity.id}_normal.png`;

    return `${ASSETS_ROOT}/identities/${identity.id}_${uptie ? "gacksung" : "normal"}.png`;
}

function IdentityImageMain({ identity, className, style, uptie }) {
    return <img
        className={className}
        src={getSrc(identity, uptie)}
        alt={identity.name} title={identity.name}
        style={{ ...style, objectFit: "cover" }}
        loading="lazy"
    />
}

function IdentityImageFetch({ id, ...props }) {
    const [identities, identitiesLoading] = useData("identities_mini");

    if (identitiesLoading) {
        return null;
    } else if (!(id in identities)) {
        console.warn(`Identity ${id} not found.`);
        return null;
    } else {
        return <IdentityImageMain identity={identities[id]} {...props} />
    }
}

export default function IdentityImage({ id, identity = null, style = {}, ...props }) {
    const newStyle = { width: "100%", height: "auto", ...style };

    if (identity) {
        return <IdentityImageMain identity={identity} style={newStyle} {...props} />
    } else {
        return <IdentityImageFetch id={id} style={newStyle} {...props} />
    }
}
