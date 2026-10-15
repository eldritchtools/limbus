/* eslint-disable @next/next/no-img-element */
import { categories } from "./util";
import { getGiftImgSrc } from "../components/icons/GiftIcon";
import { getRpgItemImgSrc } from "../components/icons/RPGItemIcon";
import { itemsTypeMapping } from "../gms-explorer/util";

function ProblemLayout({ category, icon, info1, info2, info3, settings, hidden }) {
    return <div style={{ display: "flex", gap: "1rem" }}>
        <img src={icon} alt={""} title={""}
            style={{
                filter: hidden ?
                    "brightness(0) drop-shadow(1px 0 0 white) drop-shadow(-1px 0 0 white) drop-shadow(0 1px 0 white) drop-shadow(0 -1px 0 white)" :
                    null,
                maxWidth: "96px"
            }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {settings.showCategory && <span>Category: {categories[category].label}</span>}
            {settings.additionalInfo >= 1 && <span>{info1}</span>}
            {settings.additionalInfo >= 2 && <span>{info2}</span>}
            {settings.additionalInfo >= 3 && <span>{info3}</span>}
        </div>
    </div>
}

export default function Problem({ settings, guesser, data, hidden = true }) {
    const { category, answer } = guesser.currentProblem;

    if (category === "gifts") {
        const giftData = data[category][answer];
        return <ProblemLayout
            category={category}
            icon={getGiftImgSrc(giftData)}
            info1={`Affinity: ${giftData.affinity}`}
            info2={`Tier: ${giftData.tier}`}
            info3={`Keyword: ${giftData.keyword}`}
            settings={settings}
            hidden={hidden}
        />
    }

    if (category === "gmsItem") {
        const itemData = data[category][answer];
        return <ProblemLayout
            category={category}
            icon={getRpgItemImgSrc(answer)}
            info1={`Type: ${itemsTypeMapping[itemData.type]}`}
            info2={`First Obtainable Route: ${itemData.sources[0].route.toUpperCase()}`}
            info3={`First Obtainable Floor: ${itemData.sources[0].floor}`}
            settings={settings}
            hidden={hidden}
        />
    }
}