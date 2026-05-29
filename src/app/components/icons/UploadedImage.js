/* eslint-disable @next/next/no-img-element */
"use client";

import { UPLOADS_ROOT } from "@/app/paths";

export function constructUploadedImgSrc(id, type) {
    // "sm" or "lg"
    return `${UPLOADS_ROOT}/images/${id}/${type}.webp`;
}

export default function UploadedImage({ id, type, className, style = {} }) {
    if (!id) return null;
    const src = constructUploadedImgSrc(id, type);
    return <img src={src} alt="image" className={className} style={style} />
}
