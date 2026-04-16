/* eslint-disable @next/next/no-img-element */
"use client";

// import Image from "next/image";

import { useData } from "../DataProvider";

import { ASSETS_ROOT } from "@/app/paths";

function rescaleThemePack(scale) {
    return { width: `${380 * scale}px`, height: `${690 * scale}px` };
}

function rescaleOverlay(scale) {
    return { width: `${380 * scale}px`, height: `${432 * scale}px` };
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
        <img src={`${ASSETS_ROOT}/theme_packs/${themePack.image}.png`}
            alt={themePack.name} title={themePack.name}
            style={{ ...scaledStyle, position: "absolute", left: 0, top: 0 }}
        />
        {themePack.overlayImage ?
            <img src={`${ASSETS_ROOT}/theme_packs/${themePack.overlayImage}.png`}
                alt={themePack.name} title={themePack.name}
                style={{ ...rescaleOverlay(scale), position: "absolute", left: 0, top: 100 * scale }}
            /> :
            null
        }
        {displayName ?
            <div style={{
                position: "absolute", bottom: "4px", left: "50%", transform: "translateX(-50%)", width: "95%", maxHeight: "70%", overflow: "hidden",
                display: "block", textAlign: "center", color: "#ddd", fontWeight: "600", lineHeight: "1.1", textWrap: "balance",
                textShadow: "0 0 4px #000, 0 0 12px #000, 2px 2px 4px #000, -2px -2px 4px #000", fontSize: "1rem"
            }}>
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
