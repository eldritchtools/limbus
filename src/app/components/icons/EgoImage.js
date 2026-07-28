/* eslint-disable @next/next/no-img-element */
"use client";

import { useData } from "../DataProvider";
import { getEgoArtSrc } from "./imgSrc";

function EgoImageMain({ ego, className, style }) {
    return <img
        className={className}
        src={getEgoArtSrc(ego.id)}
        alt={ego.name} title={ego.name}
        style={{ ...style, objectFit: "cover" }}
        loading="lazy"
    />
}

function EgoImageFetch({ id, ...props }) {
    const [egos, egosLoading] = useData("egos_mini");
    if (egosLoading) {
        return null;
    } else if (!(id in egos)) {
        console.warn(`Ego ${id} not found.`);
        return null;
    } else {
        return <EgoImageMain ego={egos[id]} {...props} />
    }

}

export default function EgoImage({ id, ego = null, style = {}, ...props }) {
    const newStyle = { width: "100%", height: "auto", ...style };

    if (ego) {
        return <EgoImageMain ego={ego} style={newStyle} {...props} />
    } else {
        return <EgoImageFetch id={id} style={newStyle} {...props} />
    }
}
