/* eslint-disable @next/next/no-img-element */

// import Image from "next/image";

import { ASSETS_ROOT } from "@/app/paths";

export default function BannerIcon({ path, style = {} }) {
    // const { width, height } = style;
    // return <div style={{ width, height }}>
        {/* <Image src={`${ASSETS_ROOT}/banners/${path}.png`} alt={path} title={path} fill sizes="32px" style={{ ...remStyle, objectFit: "cover" }} /> */}
        return <img src={`${ASSETS_ROOT}/banners/${path}.webp`} alt={path} title={path} style={{ width: "100%", ...style }} />
    // </div>
}