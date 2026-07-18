/* eslint-disable @next/next/no-img-element */

// import Image from "next/image";

import GiftIconClient from "./GiftIconClient";
import styles from "./Icon.module.css";
import KeywordIcon from "./KeywordIcon";
import TierIcon from "./TierIcon";
import DataLoader from "../DataLoader";

import { ASSETS_ROOT } from "@/app/paths";

function scaleSize(scale) {
    return Math.round(96 * scale);
}

export function getGiftImgSrc(gift) {
    if ("srcPath" in gift) return `${ASSETS_ROOT}/gifts/${gift.srcPath}.png`;
    return null;
}

function GiftImg({ gift }) {
    const src = getGiftImgSrc(gift);
    if (!src) return null;

    // return <Image src={src} alt={gift.names[0]} width={64} height={64} style={style} />
    return <img src={src} alt={gift.names[0]} className={styles.giftIcon} loading="lazy" />
}

function GiftIconContainer({ scale = 1, children }) {
    const scaler = scale === 1 ? {} : { transform: `scale(${scale})`, transformOrigin: "top left" };

    return <div style={{ width: scaleSize(scale), height: scaleSize(scale) }}>
        <div className={styles.giftIconContainer} style={scaler}>
            {/* <Image src={`${ASSETS_ROOT}/ego_gift_background.png`} alt="" width={64} height={64} style={scaleStyle(giftBackgroundStyle, scale)} /> */}
            <img src={`${ASSETS_ROOT}/ego_gift_background.png`} alt="" className={styles.giftIconBackground} />
            {children}
        </div>
    </div>
}

function GiftIconMain({ id, gift, enhanceRank = 0, scale = 1, forceTagStrips }) {
    return <GiftIconContainer scale={scale}>
        <GiftImg gift={gift} />
        <TierIcon className={styles.giftIconTier} tier={gift.tier} scaleY={1.4} />
        {enhanceRank > 0 ? <TierIcon className={styles.giftIconEnhance} tier={"+".repeat(enhanceRank)} scale={1.2} /> : null}
        {gift.keyword !== "Keywordless" ? <KeywordIcon id={gift.keyword} className={styles.giftIconKeyword} /> : null}
        <GiftIconClient id={id ?? gift?.id} forceTagStrips={forceTagStrips} scale={scale} />
    </GiftIconContainer>
}

export default function GiftIcon({ id, gift, ...props }) {
    if (gift) {
        return <GiftIconMain id={id} gift={gift} {...props} />
    } else {
        return <DataLoader file="gifts" type="Gift" id={id}>
            {gift => <GiftIconMain id={id} gift={gift} {...props} />}
        </DataLoader>
    }
}