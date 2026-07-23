/* eslint-disable @next/next/no-img-element */
"use client";

// import Image from "next/image";

import { useData } from "../DataProvider";
import styles from "./Icon.module.css";
import ProcessedText from "../texts/ProcessedText";

import { ASSETS_ROOT } from "@/app/paths";

export function getAnnouncerImgSrc(announcer) {
    return `${ASSETS_ROOT}/announcers/${announcer.imgStr}.webp`;
}

function getName(announcer) {
    if(announcer.id === "47" || announcer.id === "48") return announcer.name;
    return <ProcessedText text={announcer.name} />;
}

function AnnouncerIconMain({ announcer, displayName = false, style }) {
    const img = <img src={getAnnouncerImgSrc(announcer)} alt={announcer.name} title={announcer.name} style={{ ...style,  width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />

    return <div className={styles.identityIconContainer} style={{ width: style.width, aspectRatio: "1/1" }}>
        {img}
        {displayName ?
            <div
                className={styles.identityIconName}
                style={{ fontSize: `clamp(0.6rem, calc(10cqw - (${announcer.name.length} * 0.02px)), 1rem)` }}
            >
                {getName(announcer)}
            </div> :
            null
        }
    </div>
}

function AnnouncerIconFetch({ id, ...props }) {
    const [announcers, announcersLoading] = useData("announcers");

    if (announcersLoading) {
        return null;
    } else if (!(id in announcers)) {
        console.warn(`Announcer ${id} not found.`);
        return null;
    } else {
        return <AnnouncerIconMain announcer={announcers[id]} {...props} />
    }
}

export default function AnnouncerIcon({ id, announcer = null, scale, size, width, style = {}, ...props }) {
    const newStyle = width ?
        { width: width, height: "auto", ...style } :
        size ?
            { width: `${size}px`, height: `${size}px`, ...style } :
            scale ?
                { width: `${256 * scale}px`, height: `${256 * scale}px`, ...style } :
                { width: "100%", height: "auto", ...style };

    if (announcer) {
        return <AnnouncerIconMain announcer={announcer} style={newStyle} {...props} />
    } else {
        return <AnnouncerIconFetch id={id} style={newStyle} {...props} />
    }
}
