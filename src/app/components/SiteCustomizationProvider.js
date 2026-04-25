"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { createContext, useCallback, useContext } from "react";

import { getLocalStore } from "../database/localDB";
import { customizationDefaults } from "../lib/customizationDefaults";

const SiteCustomizationContext = createContext();

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

    const exports = {
        customizationData: data,
        getCustomization,
        setCustomization,
        getCustomizationValue,
        setCustomizationValue
    }

    return <SiteCustomizationContext.Provider value={exports}>
        {children}
    </SiteCustomizationContext.Provider>;
}

export function useSiteCustomization() {
    return useContext(SiteCustomizationContext);
}
