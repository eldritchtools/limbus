/* eslint-disable @next/next/no-img-element */

// import Image from "next/image";

import { ASSETS_ROOT } from "@/app/paths";

export default function PanicIcon({ id, className, style = {} }) {
    // const { width, height } = style;
    // return <div style={{ width, height }}>
    {/* <Image src={`${ASSETS_ROOT}/icons/${path}.png`} alt={path} title={path} fill sizes="32px" style={{ ...remStyle, objectFit: "cover" }} /> */ }
    return <img className={className} src={`${ASSETS_ROOT}/panic/${id}.webp`} alt={id} title={id} style={style} />
    // </div>
}