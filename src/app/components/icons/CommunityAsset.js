/* eslint-disable @next/next/no-img-element */
"use client";

import { UPLOADS_ROOT } from "@/app/paths";

export function constructCommunityAssetSrc(id, type) {
    // "sm" or "lg"
    return `${UPLOADS_ROOT}/community_assets/${id}/${type}.webp`;
}

export default function CommunityAsset({ id, type, className, style = {} }) {
    if (!id) return null;
    const sp = id.split("_");
    const cleaned = sp[sp.length-1];
    const src = constructCommunityAssetSrc(cleaned, type);
    return <img src={src} alt={id} className={className} style={style} />
}
