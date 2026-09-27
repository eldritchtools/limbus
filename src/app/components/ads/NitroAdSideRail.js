"use client";

import { useEffect, useRef, useState } from "react";

import { useSiteCustomization } from "../SiteCustomizationProvider";

const mediaQueries = {
    desktop: "(min-width: 1025px)",
    phone: "(min-width: 320px) and (max-width: 767px)",
    tablet: "(min-width: 768px) and (max-width: 1024px)"
};

export default function NitroAdSideRail({ id, allowDemo = false, forceDemo = false }) {
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
            format: "rail",
            rail: "right",
            railOffsetTop: 0,
            railOffsetBottom: 0,
            railCollisionWhitelist: [],
            railCloseColor: "#666666",
            railSpacing: 10,
            railStack: false,
            railStickyTop: 0,
            railVerticalAlign: "center",
            demo: (!nitroEnabled || forceDemo) ? "true" : undefined,
            report: {
                "enabled": true,
                "icon": true,
                "wording": "Report Ad",
                "position": "bottom-right"
            }
        });
    }, [nitroEnabled, showAds, allowDemo, forceDemo, id]);

    return null;
}
