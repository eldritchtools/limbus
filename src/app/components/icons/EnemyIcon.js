/* eslint-disable @next/next/no-img-element */
"use client";

// import Image from "next/image";

import { ASSETS_ROOT } from "@/app/paths";

export default function EnemyIcon({ id, style = {} }) {
    const { width, height } = style;
    return <div style={{ width, height, position: "relative" }}>
        {/* <Image src={`${ASSETS_ROOT}/banners/${path}.png`} alt={path} title={path} fill sizes="32px" style={{ ...remStyle, objectFit: "cover" }} /> */}
        <img src={`${ASSETS_ROOT}/encounters/${id}_portrait.png`} alt={id} title={id} style={{ ...style, objectFit: "cover" }} />
    </div>
}