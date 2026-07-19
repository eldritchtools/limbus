/* eslint-disable @next/next/no-img-element */
"use client";

// import Image from "next/image";

import { useData } from "../DataProvider";
import styles from "./Icon.module.css";

import { ASSETS_ROOT } from "@/app/paths";

function rescaleThemePack(scale) {
    return { width: `${380 * scale}px`, height: `${690 * scale}px` };
}

function rescaleOverlay(scale) {
    return { width: `${380 * scale}px`, height: `${432 * scale}px` };
}

export function getThemePackImgSrc(themePack) {
    return `${ASSETS_ROOT}/theme_packs/${themePack.image}.webp`;
}

export function getThemePackOverlayImgSrc(themePack) {
    if(themePack.overlayImage) return `${ASSETS_ROOT}/theme_packs/${themePack.overlayImage}.webp`;
    return null;
}


function ThemePackIconMain({ id, themePack = null, displayName = false, scale = 1 }) {
    const scaledStyle = rescaleThemePack(scale);
    return <div style={{ ...scaledStyle, position: "relative", left: 0, top: 0 }}>
        {/* <Image src={`${ASSETS_ROOT}/theme_packs/${themePack.image}.png`}
            alt={themePack.name} title={themePack.name}
            width={380} height={690}
            style={{ ...scaledStyle, position: "absolute", left: 0, top: 0 }}
        />
        {themePack.overlayImage ?
            <Image src={`${ASSETS_ROOT}/theme_packs/${themePack.overlayImage}.png`}
                alt={themePack.name} title={themePack.name}
                width={391} height={432}
                style={{ ...rescaleOverlay(scale), position: "absolute", left: 0, top: 100 * scale }}
            /> :
            null
        } */}
        <img src={getThemePackImgSrc(themePack)}
            alt={themePack.name} title={themePack.name}
            style={{ ...scaledStyle, position: "absolute", left: 0, top: 0 }}
            loading="lazy"
        />
        {themePack.overlayImage ?
            <img src={getThemePackOverlayImgSrc(themePack)}
                alt={themePack.name} title={themePack.name}
                style={{ ...rescaleOverlay(scale), position: "absolute", left: 0, top: 100 * scale }}
                loading="lazy"
            /> :
            null
        }
        {displayName ?
            <div className={styles.nameOverlay}>
                {themePack.name}
            </div> :
            null
        }
    </div>
}

function ThemePackIconFetch({ id, ...params }) {
    const [themePacks, themePacksLoading] = useData("md_theme_packs");

    if (themePacksLoading) {
        return null;
    } else if (!(id in themePacks)) {
        console.warn(`Theme Pack ${id} not found.`);
        return null;
    } else {
        return <ThemePackIconMain id={id} themePack={themePacks[id]} {...params} />
    }
}

export default function ThemePackIcon({ id, themePack = null, ...params }) {
    if (themePack) {
        return <ThemePackIconMain id={id ?? themePack?.id} themePack={themePack} {...params} />
    } else {
        return <ThemePackIconFetch id={id} {...params} />
    }
}
