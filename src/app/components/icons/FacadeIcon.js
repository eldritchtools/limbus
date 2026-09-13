/* eslint-disable @next/next/no-img-element */

// import Image from "next/image";

import styles from "./Icon.module.css";
import DataLoader from "../DataLoader";

import { ASSETS_ROOT } from "@/app/paths";

export function getFacadeImgSrc(facade) {
    if(facade.facadeOnly)
        return `${ASSETS_ROOT}/facades/${facade.id}_gacksung_profile.webp`;
    
    return `${ASSETS_ROOT}/identities/${facade.id}_gacksung_profile.webp`;
}

function FacadeIconMain({ facade, style, displayName = false, lazyLoad = true }) {
    const img =
        <img src={getFacadeImgSrc(facade)}
            alt={facade.name} title={facade.name}
            style={{ ...style, width: "100%", height: "100%", objectFit: "cover" }}
            loading={lazyLoad ? "lazy" : "eager"}
        />

    return <div className={styles.identityIconContainer} style={{ width: style.width }}>
        {img}
        <div className={styles.upcomingLabel}>Façade</div>
        {displayName ?
            <div
                className={styles.identityIconName}
                style={{ fontSize: `clamp(0.6rem, calc(10cqw - (${facade.name.length} * 0.02px)), 1rem)` }}
            >
                {facade.name}
            </div> :
            null
        }
    </div>
}

export default function FacadeIcon({ id, facade = null, scale, size, width, style = {}, ...props }) {
    const newStyle = width ?
        { width: width, height: "auto", ...style } :
        size ?
            { width: `${size}px`, height: `${size}px`, ...style } :
            scale ?
                { width: `${256 * scale}px`, height: `${256 * scale}px`, ...style } :
                { width: "100%", height: "auto", ...style };

    if (facade) {
        return <FacadeIconMain facade={facade} style={newStyle} {...props} />
    } else {
        return <DataLoader file="facades" type="Facade" id={id}>
            {facade => <FacadeIconMain id={id} facade={facade} style={newStyle} {...props} />}
        </DataLoader>
    }
}
