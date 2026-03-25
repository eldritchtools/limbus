"use client";

import Image from "next/image";

import { ASSETS_ROOT } from "@/app/paths";

export default function Icon({ path, style = {} }) {
    const { width, height, ...remStyle } = style;
    return <div style={{ width, height, position: "relative" }}>
        <Image src={`${ASSETS_ROOT}/icons/${path}.png`} alt={path} title={path} fill sizes="32px" style={{ ...remStyle, objectFit: "cover" }} />
    </div>
}