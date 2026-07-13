"use client";

import { tokensDescs } from "./tokens";
import { getAdditionalIconSrc } from "../icons/AdditionalIcon";
import { getGiftImgSrc } from "../icons/GiftIcon";
import { getIdentityImgSrc } from "../icons/IdentityIcon";
import { getEgoImgSrc } from "../icons/imgSrc";
import { getKeywordImgSrc } from "../icons/KeywordIcon";
import { getSinnerIconSrc } from "../icons/SinnerIcon";
import { getSkillIconSrc } from "../icons/SkillIcon";
import { getStatusImgSrc } from "../icons/StatusIcon";
import { getThemePackImgSrc, getThemePackOverlayImgSrc } from "../icons/ThemePackIcon";

import { replaceStatusesInString } from "@/app/lib/statusReplacement";

function constructWrapper(maxWidth) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.padding = "8px 12px";
    wrapper.style.maxWidth = `${maxWidth}px`;
    wrapper.style.color = "var(--primary-text-color)";
    wrapper.style.fontFamily = "sans-serif";
    return wrapper;
}

function constructImageElement(path, size) {
    if (!path) return null;
    const img = document.createElement("img");
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    img.style.objectFit = "contain";
    img.style.borderRadius = "4px";
    img.addEventListener("error", () => {
        img.style.display = "none";
    });
    img.src = path;
    return img;
}

function constructTitleElement(name, left = false, withIcon = null) {
    const title = document.createElement("div");
    title.textContent = name;
    title.style.fontSize = "1.1rem";
    title.style.fontWeight = "600";

    if (left) {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.flexDirection = "row";
        row.style.alignItems = "center";
        row.style.gap = "4px";
        row.style.marginBottom = "8px";

        title.style.flexGrow = "1";
        if (withIcon) row.appendChild(constructImageElement(withIcon, 32))
        row.appendChild(title);
        return row;
    } else {
        title.style.marginBottom = "8px";
        title.style.textAlign = "center";
        return title;
    }
}

function constructTextElement(text) {
    const textBlock = document.createElement("div");
    textBlock.textContent = text || "";
    textBlock.style.fontSize = "0.85rem";
    textBlock.style.lineHeight = "1.25";
    textBlock.style.whiteSpace = "pre-wrap";
    textBlock.style.color = "var(--primary-text-color)";

    return textBlock;
}

function constructIdentityAutocompleteTooltip(entry) {
    const wrapper = constructWrapper(240);

    wrapper.appendChild(constructTitleElement(entry.name));

    const imgContainer = document.createElement("div");
    imgContainer.style.display = "flex";
    imgContainer.style.flexDirection = "row";
    imgContainer.style.justifyContent = "center";

    if (!entry.tags.includes("Base Identity"))
        imgContainer.appendChild(constructImageElement(getIdentityImgSrc(entry, 2), 128))
    imgContainer.appendChild(constructImageElement(getIdentityImgSrc(entry, 4), 128))

    wrapper.appendChild(imgContainer);

    return wrapper;
}

function constructEgoAutocompleteTooltip(entry) {
    const wrapper = constructWrapper(240);

    wrapper.appendChild(constructTitleElement(entry.name));

    const imgContainer = document.createElement("div");
    imgContainer.style.display = "flex";
    imgContainer.style.flexDirection = "row";
    imgContainer.style.justifyContent = "center";

    imgContainer.appendChild(constructImageElement(getEgoImgSrc(entry, "awaken"), 128))
    if ("corrosionType" in entry)
        imgContainer.appendChild(constructImageElement(getEgoImgSrc(entry, "erosion"), 128))

    wrapper.appendChild(imgContainer);

    return wrapper;
}

function constructSkillAutocompleteTooltip(entry) {
    const wrapper = constructWrapper(240);

    wrapper.appendChild(constructTitleElement(entry.name));

    const body = document.createElement("div");
    body.style.display = "flex";
    body.style.flexDirection = "row";
    body.style.alignItems = "center";
    body.style.justifyContent = "center";
    body.style.gap = "0.2rem";

    body.appendChild(constructImageElement(getSkillIconSrc(entry), 92));

    const details = document.createElement("div");
    details.style.display = "flex";
    details.style.flexDirection = "column";
    details.style.gap = "0.2rem";

    details.appendChild(constructTextElement(
        `Power: ${entry.baseValue} ${entry.coinValue < 0 ? entry.coinValue : `+${entry.coinValue}`}`
    ));

    details.appendChild(constructTextElement(
        `Coins: ${entry.coins.length}`
    ));

    const keywords = document.createElement("div");
    keywords.style.display = "flex";

    keywords.appendChild(constructImageElement(getKeywordImgSrc(entry.affinity), 32));
    if(entry.defType === "attack") {
        keywords.appendChild(constructImageElement(getKeywordImgSrc(entry.atkType), 32));
    } else if(entry.defType === "counter") {
        keywords.appendChild(constructImageElement(getKeywordImgSrc(entry.defType), 32));
        keywords.appendChild(constructImageElement(getKeywordImgSrc(entry.atkType), 32));
    } else {
        keywords.appendChild(constructImageElement(getKeywordImgSrc(entry.defType), 32));
    }

    details.appendChild(keywords);
    body.appendChild(details);

    wrapper.appendChild(body);

    return wrapper;
}

function constructStatusAutocompleteTooltip(entry) {
    const wrapper = constructWrapper(320);

    wrapper.appendChild(constructTitleElement(entry.name, true, getStatusImgSrc(entry)));
    wrapper.appendChild(constructTextElement(entry.desc));

    return wrapper;
}

function constructGiftAutocompleteTooltip(entry, otherData) {
    const wrapper = constructWrapper(320);

    wrapper.appendChild(constructTitleElement(entry.names[0], true, getGiftImgSrc(entry)));
    wrapper.appendChild(constructTextElement(replaceStatusesInString(entry.descs[0], otherData, {})));

    return wrapper;
}

function constructThemePackAutocompleteTooltip(entry) {
    const wrapper = constructWrapper(200);

    wrapper.appendChild(constructTitleElement(entry.name));

    const container = document.createElement("div");
    container.style.width = "190px";
    container.style.height = "345px";
    container.style.position = "relative";
    container.style.left = 0;
    container.style.top = 0;

    const imgMain = document.createElement("img");
    imgMain.style.width = "190px";
    imgMain.style.height = "345px";
    imgMain.style.position = "absolute";
    imgMain.style.left = 0;
    imgMain.style.top = 0;
    imgMain.src = getThemePackImgSrc(entry);
    container.appendChild(imgMain);

    if (entry.overlayImage) {
        const imgOverlay = document.createElement("img");
        imgOverlay.style.width = "190px";
        imgOverlay.style.height = "216px";
        imgOverlay.style.position = "absolute";
        imgOverlay.style.left = 0;
        imgOverlay.style.top = "50px";
        imgOverlay.src = getThemePackOverlayImgSrc(entry);
        container.appendChild(imgOverlay);
    }

    wrapper.appendChild(container);
    return wrapper;
}

function constructIconAutocompleteTooltip(entry) {
    const wrapper = constructWrapper(320);

    wrapper.appendChild(constructTitleElement(entry.name, true, getAdditionalIconSrc(entry.id)));

    return wrapper;
}

function constructSinnerIconAutocompleteTooltip(entry) {
    const wrapper = constructWrapper(40);
    
    const img = document.createElement("img");
    img.style.width = "32px";
    img.style.height = "32px";
    img.src = getSinnerIconSrc(entry);
    wrapper.appendChild(img);

    return wrapper;
}

export default function constructMarkdownEditorAutocompleteTooltip(entry, type, otherData = null) {
    if (type === "identity") return constructIdentityAutocompleteTooltip(entry);
    if (type === "ego") return constructEgoAutocompleteTooltip(entry);
    if (type === "skillOwner") {
        if(entry.id[0] === '1') return constructIdentityAutocompleteTooltip(entry);
        else if(entry.id[0] === '2') return constructEgoAutocompleteTooltip(entry);
        return null;
    }
    if (type === "skill") return constructSkillAutocompleteTooltip(entry);
    if (type === "status" || type === "statusicon") return constructStatusAutocompleteTooltip(entry);
    if (type === "giftname" || type === "gifticons") return constructGiftAutocompleteTooltip(entry, otherData);
    if (type === "themepack") return constructThemePackAutocompleteTooltip(entry);
    // if (type === "encounter") return constructEncounterAutocompleteTooltip(entry);
    if (type === "icon") return constructIconAutocompleteTooltip(entry);
    if (type === "sinnericon") return constructSinnerIconAutocompleteTooltip(entry);
    return null;
}

export function constructMarkdownEditorTypeTooltip(type) {
    const wrapper = constructWrapper(320);

    wrapper.appendChild(constructTitleElement(type));
    wrapper.appendChild(constructTextElement(tokensDescs[type]));

    return wrapper;
}