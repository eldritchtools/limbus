"use client";

import { GiftTagStrips } from "../gifts/GiftTags";
import { useSiteCustomization } from "../SiteCustomizationProvider";

export default function GiftIconClient({ id, forceTagStrips, scale }) {
    const { getCustomizationValue } = useSiteCustomization();

    const tagStrips = forceTagStrips === undefined ? getCustomizationValue("giftTagStrips") : forceTagStrips;

    return <>
        {tagStrips ? <GiftTagStrips id={id} scale={scale} /> : null}
    </>;
}