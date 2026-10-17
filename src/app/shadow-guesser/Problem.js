/* eslint-disable @next/next/no-img-element */
import React from "react";

import { categories } from "./util";
import { getGiftImgSrc } from "../components/icons/GiftIcon";
import Icon from "../components/icons/Icon";
import KeywordIcon from "../components/icons/KeywordIcon";
import { getRpgItemImgSrc } from "../components/icons/RPGItemIcon";
import TierIcon from "../components/icons/TierIcon";
import { itemsTypeMapping } from "../gms-explorer/util";
import { ColoredResistance } from "../lib/colors";
import { LEVEL_CAP } from "../lib/constants";
import { constructDefenseLevel, constructHp, constructSpeed } from "../lib/identity";
import { ASSETS_ROOT } from "../paths";

const sizes = {
    "ids": 200,
    "ego": 250,
    "gifts": 100,
    "gmsItem": 100,
}

function ProblemLayout({ category, icon, info1, info2, info3, settings, hidden }) {
    return <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ width: `${sizes[category]}px`, height: `${sizes[category]}px` }}>
            <img src={icon} alt={""} title={""}
                style={{
                    filter: hidden ?
                        "brightness(0) drop-shadow(1px 0 0 white) drop-shadow(-1px 0 0 white) drop-shadow(0 1px 0 white) drop-shadow(0 -1px 0 white)" :
                        null,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain"
                }} />
        </div>
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
    const props = { category, settings, hidden };

    if (category === "ids") {
        const idData = data[category][answer];
        props.icon = `${ASSETS_ROOT}/identities/${answer}_sprite_idle.webp`;
        props.info1 = <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <Icon path={"hp"} style={{ width: "32px", height: "32px" }} />
            {constructHp(idData, LEVEL_CAP, false)}
            <Icon path={"speed"} style={{ width: "32px", height: "32px" }} />
            {constructSpeed(idData)}
            <Icon path={"defense level"} style={{ width: "32px", height: "32px" }} />
            {constructDefenseLevel(idData)}
        </span>;
        props.info2 = <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <KeywordIcon id={"Slash"} />
            <ColoredResistance resist={idData.resists.slash} />
            <KeywordIcon id={"Pierce"} />
            <ColoredResistance resist={idData.resists.pierce} />
            <KeywordIcon id={"Blunt"} />
            <ColoredResistance resist={idData.resists.blunt} />
        </span>;
        props.info3 = <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            Has skill:
            <KeywordIcon id={guesser.currentProblem.sampleSkillType.affinity} />
            <KeywordIcon id={guesser.currentProblem.sampleSkillType.type} />
        </span>
    }

    if (category === "ego") {
        props.icon = `${ASSETS_ROOT}/egos/${answer}_sprite_idle.webp`;
        props.info1 = <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            Partial Resists:
            {Object.entries(guesser.currentProblem.resists).map(([id, value]) => <React.Fragment key={id}>
                <KeywordIcon id={id} />
                <ColoredResistance resist={value} />
            </React.Fragment>)}
        </span>;
        props.info2 = <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            Partial Cost:
            {Object.entries(guesser.currentProblem.costs).map(([id, value]) => <React.Fragment key={id}>
                <KeywordIcon id={id} />
                <span style={{ color: value === 0 ? "var(--disabled-text-color)" : null }}>x{value}</span>
            </React.Fragment>)}
        </span>;
        props.info3 = <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            Awakening Type:
            <KeywordIcon id={guesser.currentProblem.skillType.affinity} />
            <KeywordIcon id={guesser.currentProblem.skillType.type} />
        </span>
    }

    if (category === "gifts") {
        const giftData = data[category][answer];
        props.icon = getGiftImgSrc(giftData);
        props.info1 = <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            Affinity:
            <KeywordIcon id={giftData.affinity} />
        </span>;
        props.info2 = <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            Tier:
            <TierIcon tier={giftData.tier} />
        </span>;
        props.info3 = giftData.keyword === "Keywordless" ?
            `Keyword: ${giftData.keyword}` :
            <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                Keyword:
                <KeywordIcon id={giftData.keyword} />
            </span>;
    }

    if (category === "gmsItem") {
        const itemData = data[category][answer];
        props.icon = getRpgItemImgSrc(answer);
        props.info1 = `Type: ${itemsTypeMapping[itemData.type]}`;
        props.info2 = `First Obtainable Route: ${itemData.sources[0].route.toUpperCase()}`;
        props.info3 = `First Obtainable Floor: ${itemData.sources[0].floor}`;
    }

    return <ProblemLayout {...props} />
}