import Image from "next/image";
import { useState } from "react";

import { useData } from "../DataProvider";

import { ASSETS_ROOT } from "@/app/paths";

export function getStatusImgSrc(status, fallback = null) {
    const src = fallback ?? ("imageOverride" in status ? status.imageOverride : status.name);
    return `${ASSETS_ROOT}/statuses/${src}.png`;
}

function StatusIconMain({ id, status, style }) {
    const [fallback, setFallback] = useState(false);
    const [iconVisible, setIconVisible] = useState(true);

    if (!iconVisible) return null;
    const src = getStatusImgSrc(status, fallback ? (id ?? status.id) : null);

    const handleError = () => {
        if (!fallback) {
            setFallback(true);
        } else {
            setIconVisible(false);
        }
    }

    return <Image src={src} alt={status.name} width={32} height={32} style={style} onError={handleError} />
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
