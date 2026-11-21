"use client";

import { useEffect, useRef, useState } from "react";

import { useSiteCustomization } from "../SiteCustomizationProvider";

export default function NitroAnchorAd({ id, allowDemo = false, forceDemo = false }) {
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
            format: "anchor-v2",
            anchor: "bottom",
            anchorBgColor: "rgb(0 0 0 / 80%)",
            anchorClose: true,
            anchorPersistClose: false,
            anchorStickyOffset: 0,
            report: {
                enabled: true,
                icon: true,
                wording: "Report Ad",
                position: "bottom-right-side"
            },
            // non desktop
            mediaQuery: "(min-width: 768px) and (max-width: 1024px), (min-width: 320px) and (max-width: 767px)"
        });
    }, [nitroEnabled, showAds, allowDemo, forceDemo, id]);

    return null;
}
