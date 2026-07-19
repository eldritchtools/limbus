import { ASSETS_ROOT } from "@/app/paths";

export function getEgoImgSrc(ego, type) {
    if (ego.upcoming) return `${ASSETS_ROOT}/${ego.src}.png`;
    return `${ASSETS_ROOT}/egos/${ego.id}_${type}_profile.webp`;
}