/* eslint-disable @next/next/no-img-element */

// import Image from "next/image";

import DataLoader from "../DataLoader";
import styles from "./Icon.module.css";

import { ASSETS_ROOT } from "@/app/paths";

export function getStatusImgSrc(status) {
    if ("srcPath" in status) return `${ASSETS_ROOT}/statuses/${status.srcPath}.webp`;
    return null;
}

function StatusIconMain({ status, className, style }) {
    const src = getStatusImgSrc(status);
    if (!src) return null;
    if (src.includes("?")) return null;
    // return <Image src={src} alt={status.name} width={32} height={32} style={style} />
    return <img src={src} alt={status.name} className={className ?? styles.iconFullWidth} style={style} loading="lazy" />
}

export default function StatusIcon({ id, status = null, className, style = {} }) {
    if (status) {
        return <StatusIconMain id={id ?? status?.id} status={status} className={className} style={style} />
    } else {
        return <DataLoader file="statuses" type="status" id={id}>
            {status => <StatusIconMain id={id} status={status} className={className} style={style} />}
        </DataLoader>
    }
}
