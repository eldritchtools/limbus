import Image from "next/image";

import KeywordIcon from "./KeywordIcon";
import TierIcon from "./TierIcon";

import { giftTagColors } from "@/app/lib/colors";
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

function getGiftImgSrc(gift, fallback = null) {
    const src = fallback ?? ("imageOverride" in gift ? gift["imageOverride"] : gift.names[0]);
    return `${ASSETS_ROOT}/gifts/${src}.png`;
}

function GiftImg({ gift, style }) {
    const [fallback, setFallback] = useState(false);
    const [iconVisible, setIconVisible] = useState(true);

    if (!iconVisible) return null;
    const src = getGiftImgSrc(gift, fallback ? gift.id : null);

    const handleError = () => {
        if (!fallback) {
            setFallback(true);
        } else {
            setIconVisible(false);
        }
    }

    return <Image src={src} alt={gift.names[0]} width={64} height={64} style={style} onError={handleError} />
}

function TagStrips({ gift, scale }) {
    const scaledSize = { width: `${12 * scale}px`, height: `${4 * scale}px` };
    return <div style={{ display: "flex", flexDirection: "column", gap: "2px", position: "absolute", bottom: "50%", left: "0" }}>
        {gift.enhanceable ? <div style={{ ...scaledSize, background: giftTagColors.enhanceable }} /> : null}
        {gift.ingredientOf ? <div style={{ ...scaledSize, background: giftTagColors.ingredient }} /> : null}
        {gift.fusion ? <div style={{ ...scaledSize, background: giftTagColors.fusion }} /> : null}
        {gift.hardonly ? <div style={{ ...scaledSize, background: giftTagColors.hardonly }} /> : null}
        {gift.cursedPair ? <div style={{ ...scaledSize, background: giftTagColors.cursed }} /> : null}
        {gift.blessedPair ? <div style={{ ...scaledSize, background: giftTagColors.blessed }} /> : null}
    </div>
}

function GiftIconContainer({ scale = 1, children }) {
    return <div style={scaleStyle(giftContainerStyle, scale)}>
        <Image src={`${ASSETS_ROOT}/ego_gift_background.png`} alt="" width={64} height={64} style={scaleStyle(giftBackgroundStyle, scale)} />
        {children}
    </div>
}

function GiftIconMain({ gift, enhanceRank = 0, scale = 1, tagStrips }) {
    return <GiftIconContainer>
        <GiftImg gift={gift} style={scaleStyle(giftStyle, scale * 0.75)} />
        <span style={giftTierStyle}><TierIcon tier={gift.tier} scale={scale} scaleY={1.4} /></span>
        {enhanceRank > 0 ? <span style={giftEnhanceStyle}><TierIcon tier={"+".repeat(enhanceRank)} scale={scale*1.2} /></span> : null}
        {gift.keyword !== "Keywordless" ? <span style={giftKeywordStyle}><KeywordIcon id={gift.keyword} size={scaleSize(scale*0.3)} /></span> : null}
        {tagStrips ? <TagStrips gift={gift} scale={scale} /> : null}
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
