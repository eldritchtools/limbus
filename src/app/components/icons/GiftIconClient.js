"use client";

import { GiftTagStrips } from "../gifts/GiftTags";
import { useSiteCustomization } from "../SiteCustomizationProvider";

export default function GiftIconClient({ id, forceTagStrips }) {
    const { getCustomizationValue } = useSiteCustomization();

    if (typeof window === undefined) return null;

    const tagStrips = forceTagStrips === "undefined" ? getCustomizationValue("giftTagStrips") : forceTagStrips;

    return <>
        {tagStrips ? <GiftTagStrips id={id} scale={scale} /> : null}
    </>;
}