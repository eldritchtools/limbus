/* eslint-disable @next/next/no-img-element */

import { UPLOADS_ROOT } from "@/app/paths";

function constructSrc(id, type) {
    return `${UPLOADS_ROOT}/avatars/${id}/${type}.webp`;
}

export default function Avatar({ avatarId, size = 64, style = {} }) {
    if (!avatarId) return null;
    const src = constructSrc(avatarId, size <= 64 ? "sm" : "md");
    return <img src={src} alt="avatar" width={size} height={size} style={{ borderRadius: "50%", ...style }} />
}
