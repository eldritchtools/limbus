"use client";

import { useEffect, useRef, useState } from "react";

import { useSiteCustomization } from "../SiteCustomizationProvider";

export default function NitroAd({ id, height = 250, allowDemo = false, forceDemo = false, style }) {
    const { getCustomizationValue } = useSiteCustomization();
    const initializedRef = useRef(false);

    const [showAds] = useState(() => getCustomizationValue("showAds"));
    const nitroEnabled = process.env.NEXT_PUBLIC_ENABLE_NITRO_ADS === "true";

    useEffect(() => {
        if (!nitroEnabled && !allowDemo) {
            return;
        }

        if (!showAds || initializedRef.current || !window.nitroAds) {
            return;
        }

        initializedRef.current = true;

        window.nitroAds.createAd(id, {
            height,
            delayLoading: true,
            demo: (!nitroEnabled || forceDemo) ? "true" : undefined,
            report: {
                enabled: true,
                icon: true,
                wording: "Report Ad",
                position: "bottom-right",
            },
        });
    }, [nitroEnabled, showAds, allowDemo, forceDemo, id, height]);

    if (!nitroEnabled && !allowDemo) {
        return <div style={{...style, height, display: "flex", alignItems: "center", justifyContent: "center", border: "1px var(--primary-border-color) solid" }}>
            {id} Ad
        </div>
    }

    if (!showAds) return null;

    return <div id={id} style={{ ...style, height }} />;
}
