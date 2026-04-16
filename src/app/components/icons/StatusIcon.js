/* eslint-disable @next/next/no-img-element */
"use client";

// import Image from "next/image";

import { useData } from "../DataProvider";

import { ASSETS_ROOT } from "@/app/paths";

export function getStatusImgSrc(status) {
    if("srcPath" in status) return `${ASSETS_ROOT}/statuses/${status.srcPath}.png`;
    return null;
}

function StatusIconMain({ status, style }) {
    const src = getStatusImgSrc(status);
    if(!src) return null;
    if(src.includes("?")) return null;
    // return <Image src={src} alt={status.name} width={32} height={32} style={style} />
    return <img src={src} alt={status.name} style={style} />
}

function StatusIconFetch({id, style}) {
    const [statuses, statusesLoading] = useData("statuses");

    if (statusesLoading) {
        return null;
    } else if (!(id in statuses)) {
        console.warn(`Status ${id} not found.`);
        return null;
    } else {
        return <StatusIconMain id={id} status={statuses[id]} style={style} />
    }
}

export default function StatusIcon({id, status=null, style={}}) {
    if(status){
        return <StatusIconMain id={id ?? status?.id} status={status} style={style} />
    } else {
        return <StatusIconFetch id={id} style={style} />
    }
}
