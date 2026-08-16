import { ASSETS_ROOT } from "@/app/paths";

export function getEgoImgSrc(ego, type) {
    if (ego.upcoming) return `${ASSETS_ROOT}/${ego.src}.png`;
    return `${ASSETS_ROOT}/egos/${ego.id}_${type}_profile.webp`;
}

export function getEgoArtSrc(egoId) {
    return `${ASSETS_ROOT}/egos/${egoId}_cg.webp`;
}

export function getIdentityArtSrc(identityId, uptie) {
    if (String(identityId).slice(-2) === "01")
        return `${ASSETS_ROOT}/identities/${identityId}_normal.webp`;

    return `${ASSETS_ROOT}/identities/${identityId}_${uptie ? "gacksung" : "normal"}.webp`;
}

export function getIdentityImageSrc(identity, uptie) {
    if (identity.tags.includes("Base Identity"))
        return `${ASSETS_ROOT}/identities/${identity.id}_normal.webp`;

    return `${ASSETS_ROOT}/identities/${identity.id}_${uptie ? "gacksung" : "normal"}.webp`;
}