/* eslint-disable @next/next/no-img-element */
"use client";

// import Image from "next/image";

import { ASSETS_ROOT } from "@/app/paths";

export function getAdditionalIconSrc(id) {
    return `${ASSETS_ROOT}/additional_icons/${id}.png`;
}

export default function AdditionalIcon({ id, style = {} }) {
    return <img src={getAdditionalIconSrc(id)} alt={id} title={id} style={{ ...style, objectFit: "cover" }} />
}