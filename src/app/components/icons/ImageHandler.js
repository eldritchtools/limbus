/* eslint-disable @next/next/no-img-element */

// import Image from "next/image";

import { ASSETS_ROOT } from "@/app/paths";

export default function ImageHandler({ path, style = {} }) {
    return <img src={`${ASSETS_ROOT}/${path}`} alt={path} title={path} style={style} />
}