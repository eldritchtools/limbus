/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

import { ASSETS_ROOT } from "../paths"

export function SubjectSprite({ width, height, src, style = {} }) {
    const [finalSrc, setFinalSrc] = useState(Array.isArray(src) ? null : src);

    useEffect(() => {
        if (!finalSrc && Array.isArray(src))
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFinalSrc(src[Math.floor(Math.random() * src.length)]);
    }, [src, finalSrc])

    return <div style={{ width: `${width}px`, height: `${height}px`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {finalSrc &&
            <img src={`${ASSETS_ROOT}/enemy_sprites/${finalSrc}.webp`} alt={""} title={""}
                style={{ ...style, maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
        }
    </div>
}

export function GiftSprite({ width, height, src, style = {} }) {
    return <div style={{ width: `${width}px`, height: `${height}px`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={`${ASSETS_ROOT}/gifts/${src}.webp`} alt={""} title={""}
            style={{ ...style, maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
    </div>
}