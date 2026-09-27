/* eslint-disable @next/next/no-img-element */

// import Image from "next/image";

import { ASSETS_ROOT } from "@/app/paths";

export default function RPGItemIcon({ id, className, style = {} }) {
    return <div className={className} style={style}>
        <img
            src={`${ASSETS_ROOT}/rpg/items/${id}.webp`}
            alt={id} title={id}
            style={style}
            loading="lazy"
        />
    </div>;
}