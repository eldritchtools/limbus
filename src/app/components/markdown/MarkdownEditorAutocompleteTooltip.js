"use client";

import { getEgoImgSrc } from "../icons/EgoIcon";
import { getGiftImgSrc } from "../icons/GiftIcon";
import { getIdentityImgSrc } from "../icons/IdentityIcon";
import { getStatusImgSrc } from "../icons/StatusIcon";

import { replaceStatusesInString } from "@/app/lib/statusReplacement";

function constructWrapper(maxWidth) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.padding = "8px 12px";
    wrapper.style.maxWidth = `${maxWidth}px`;
    wrapper.style.color = "#ddd";
    wrapper.style.fontFamily = "sans-serif";
    return wrapper;
}

function constructImageElement(path, size, fallback=null) {
    const img = document.createElement("img");
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    img.style.objectFit = "contain";
    img.style.borderRadius = "4px";
    img.addEventListener("error", () => {
        img.src = fallback;
        img.addEventListener("error", () => {
            img.style.display = "none";
        });
    });
    img.src = path;
    return img;
}

function constructTitleElement(name, withIcon = null, iconFallback = null) {
    const title = document.createElement("div");
    title.textContent = name;
    title.style.fontSize = "1.1rem";
    title.style.fontWeight = "600";

    if (withIcon) {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.flexDirection = "row";
        row.style.alignItems = "center";
        row.style.gap = "4px";
        row.style.marginBottom = "8px";

        title.style.flexGrow = "1";
        row.appendChild(constructImageElement(withIcon, 32, iconFallback))
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
    textBlock.style.color = "#ccc";

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

function constructStatusAutocompleteTooltip(entry) {
    const wrapper = constructWrapper(320);

    wrapper.appendChild(constructTitleElement(entry.name, getStatusImgSrc(entry), getStatusImgSrc(null, entry.id)));
    wrapper.appendChild(constructTextElement(entry.desc));

    return wrapper;
}

function constructGiftAutocompleteTooltip(entry, otherData) {
    const wrapper = constructWrapper(320);

    wrapper.appendChild(constructTitleElement(entry.names[0], getGiftImgSrc(entry), getGiftImgSrc(null, entry.id)));
    wrapper.appendChild(constructTextElement(replaceStatusesInString(entry.descs[0], otherData, {})));

    return wrapper;
}

export default function constructMarkdownEditorAutocompleteTooltip(entry, type, otherData = null) {
    if (type === "identity") return constructIdentityAutocompleteTooltip(entry);
    if (type === "ego") return constructEgoAutocompleteTooltip(entry);
    if (type === "status") return constructStatusAutocompleteTooltip(entry);
    if (type === "giftname" || type === "gifticons") return constructGiftAutocompleteTooltip(entry, otherData);
    return null;
}
