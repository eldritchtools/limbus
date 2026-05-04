"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { createContext, useCallback, useContext, useEffect } from "react";

import { getLocalStore } from "../database/localDB";
import { customizationDefaults } from "../lib/customizationDefaults";

const SiteCustomizationContext = createContext();

function isLight(color) {
    if (!color) return false;

    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6;
}

export function SiteCustomizationProvider({ children }) {
    const data = useLiveQuery(
        () => getLocalStore("siteCustomization").get("main"),
        []
    );

    const getCustomization = useCallback(() => data ?? {}, [data])

    const setCustomization = async customization => {
        const res = await getLocalStore("siteCustomization").save({ id: "main", ...customization });
        return res === "main";
    }

    const getCustomizationValue = useCallback(key => data?.[key] ?? customizationDefaults[key], [data]);

    const setCustomizationValue = async (key, value) => {
        const res = await getLocalStore("siteCustomization").save({ id: "main", ...data, [key]: value });
        return res === "main";
    }

    const createPreviewContainer = ({ baseBackgroundColor, baseTextColor, surfaceContrast, textScale, font, children }) => {
        return <div
            data-theme-mode={isLight(baseBackgroundColor) ? "light" : "dark"}
            style={{
                "--bg": baseBackgroundColor,
                "--text": baseTextColor,
                "--surface-contrast": surfaceContrast,
                "--text-scale": textScale,
                "--font": font,
                background: "var(--bg-primary)"
            }}
        >
            {children}
        </div>
    }

    useEffect(() => {
        const root = document.documentElement;

        const bg = getCustomizationValue("baseBackgroundColor");
        const text = getCustomizationValue("baseTextColor");
        const contrast = getCustomizationValue("surfaceContrast");
        const scale = getCustomizationValue("textScale");
        const font = getCustomizationValue("font");

        root.style.setProperty("--bg", bg);
        root.style.setProperty("--text", text);
        root.style.setProperty("--surface-contrast", contrast);
        root.style.setProperty("--text-scale", scale);
        root.style.setProperty("--font", font);

        root.setAttribute("data-theme-mode", isLight(bg) ? "light" : "dark");
    }, [data, getCustomizationValue]);

    const exports = {
        customizationData: data,
        getCustomization,
        setCustomization,
        getCustomizationValue,
        setCustomizationValue,
        createPreviewContainer
    }

    return <SiteCustomizationContext.Provider value={exports}>
        {children}
    </SiteCustomizationContext.Provider>;
}

export function useSiteCustomization() {
    return useContext(SiteCustomizationContext);
}
