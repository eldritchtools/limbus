/* eslint-disable @next/next/no-img-element */
"use client";

// import Image from "next/image";

import KeywordIcon from "./KeywordIcon";
import TierIcon from "./TierIcon";
import { useData } from "../DataProvider";
import { GiftTagStrips } from "../gifts/GiftTags";
import { useSiteCustomization } from "../SiteCustomizationProvider";

import { ASSETS_ROOT } from "@/app/paths";

const giftContainerStyle = { position: "relative", width: "64px", height: "64px" };
const giftBackgroundStyle = { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
const giftStyle = { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
const giftTierStyle = { position: "absolute", top: "8%", left: "8%" };
const giftKeywordStyle = { position: "absolute", bottom: "5%", right: "5%" };
const giftEnhanceStyle = { position: "absolute", top: "5%", right: "5%" };

function scaleSize(scale) {
    return 96 * scale;
}

function scaleStyle(style, scale) {
    return { ...style, width: `${scaleSize(scale)}px`, height: `${scaleSize(scale)}px` };
}

export function getGiftImgSrc(gift) {
    if ("srcPath" in gift) return `${ASSETS_ROOT}/gifts/${gift.srcPath}.png`;
    return null;
}

function GiftImg({ gift, style }) {
    const src = getGiftImgSrc(gift);
    if (!src) return null;

    // return <Image src={src} alt={gift.names[0]} width={64} height={64} style={style} />
    return <img src={src} alt={gift.names[0]} style={style} />
}

function GiftIconContainer({ scale = 1, children }) {
    return <div style={scaleStyle(giftContainerStyle, scale)}>
        {/* <Image src={`${ASSETS_ROOT}/ego_gift_background.png`} alt="" width={64} height={64} style={scaleStyle(giftBackgroundStyle, scale)} /> */}
        <img src={`${ASSETS_ROOT}/ego_gift_background.png`} alt="" style={scaleStyle(giftBackgroundStyle, scale)} />
        {children}
    </div>
}

function GiftIconMain({ gift, enhanceRank = 0, scale = 1, forceTagStrips }) {
    const { getCustomizationValue } = useSiteCustomization();

    const tagStrips = forceTagStrips === undefined ? getCustomizationValue("giftTagStrips") : forceTagStrips;

    return <GiftIconContainer scale={scale}>
        <GiftImg gift={gift} style={scaleStyle(giftStyle, scale * 0.75)} />
        <span style={giftTierStyle}><TierIcon tier={gift.tier} scale={scale} scaleY={1.4} /></span>
        {enhanceRank > 0 ? <span style={giftEnhanceStyle}><TierIcon tier={"+".repeat(enhanceRank)} scale={scale * 1.2} /></span> : null}
        {gift.keyword !== "Keywordless" ? <span style={giftKeywordStyle}><KeywordIcon id={gift.keyword} size={scaleSize(scale * 0.3)} /></span> : null}
        {tagStrips ? <GiftTagStrips gift={gift} scale={scale} /> : null}
    </GiftIconContainer>
}

function GiftIconFetch({ id, ...props }) {
    const [gifts, giftsLoading] = useData("gifts");

    if (giftsLoading) {
        return null;
    } else if (!(id in gifts)) {
        console.warn(`Gift ${id} not found.`);

        return <GiftIconContainer />
    } else {
        return <GiftIconMain gift={gifts[id]} {...props} />
    }
}

export default function GiftIcon({ id, gift, ...props }) {
    if (gift) {
        return <GiftIconMain gift={gift} {...props} />
    } else {
        return <GiftIconFetch id={id} {...props} />
    }
}
