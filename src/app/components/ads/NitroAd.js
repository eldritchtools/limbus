"use client";

import { useEffect, useMemo, useRef } from "react";

import { useSiteCustomization } from "../SiteCustomizationProvider";

const mediaQueries = {
    desktop: "(min-width: 1025px)",
    phone: "(min-width: 320px) and (max-width: 767px)",
    tablet: "(min-width: 768px) and (max-width: 1024px)"
};

const adLevels = {
    none: 0,
    min: 1,
    avg: 2,
    high: 3
}

export default function NitroAd({ id, height = 250, allowDemo = false, forceDemo = false, style, mediaTypes, adLevel }) {
    const { getCustomizationValue, customizationLoading } = useSiteCustomization();
    const initializedRef = useRef(false);

    const showAd = useMemo(() => {
        if (customizationLoading) return false;
        if (!getCustomizationValue("showAds")) return false;
        if (!adLevel) return true;
        return adLevels[getCustomizationValue("additionalAds")] >= adLevels[adLevel];
    },
        [customizationLoading, getCustomizationValue, adLevel]
    );
    const nitroEnabled = process.env.NEXT_PUBLIC_ENABLE_NITRO_ADS === "true";

    useEffect(() => {
        if (!nitroEnabled && !allowDemo) {
            return;
        }

        if (!showAds || initializedRef.current || !window.nitroAds) {
            return;
        }

        initializedRef.current = true;

        const params = {
            height,
            delayLoading: true,
            demo: (!nitroEnabled || forceDemo) ? "true" : undefined,
            report: {
                enabled: true,
                icon: true,
                wording: "Report Ad",
                position: "bottom-right",
            }
        };

        if (mediaTypes) {
            params["mediaQueries"] = mediaTypes.map(x => mediaQueries[x]).join(", ");
        }

        window.nitroAds.createAd(id, params);
    }, [nitroEnabled, showAd, allowDemo, forceDemo, id, height, mediaTypes]);

    if (!showAd) return null;

    if (!nitroEnabled && !allowDemo) {
        return <div style={{ ...style, height, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px var(--primary-border-color) solid" }}>
            <span>{id}</span>
            <span>{mediaTypes}</span>
        </div>
    }

    return <div id={id} style={{ ...style, height }} />;
}