"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

import { getLocalStore } from "@/app/database/localDB";
import useLocalState from "@/app/lib/useLocalState";

const MdPlanContext = createContext();

export function MdPlanProvider({ id, children }) {
    const [tracking, setTracking] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(true);
    const [sortMarked, setSortMarked] = useLocalState("mdPlanTrackingSortMarked", false);
    const [giftsSort, setGiftsSort] = useLocalState("mdPlansGiftSort", "default");
    const [giftsSeparate, setGiftsSeparate] = useLocalState("mdPlansGiftSpearate", "none");
    const saveTimeout = useRef(null);

    useEffect(() => {
        if (trackingLoading) {
            getLocalStore("mdPlanTracking").get(id).then(x => {
                setTrackingLoading(false);
                if (!x) return;
                setTracking({ gifts: new Set(x.gifts), themePacks: new Set(x.themePacks) });
            });
        }
    }, [id, trackingLoading]);

    useEffect(() => {
        if (trackingLoading || !tracking) return;

        const saveData = async () => {
            const data = { id: id, gifts: [...tracking.gifts], themePacks: [...tracking.themePacks] };
            if (data.gifts.length === 0 && data.themePacks.length === 0)
                getLocalStore("mdPlanTracking").remove(id);
            else
                getLocalStore("mdPlanTracking").save(data);
        };

        clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(async () => {
            try {
                await saveData();
            } catch (err) {
                console.error("Unable to persist data.");
            }
        }, 1000);

        return () => clearTimeout(saveTimeout.current);
    }, [tracking, trackingLoading, id]);

    const toggleTracking = () => {
        if (tracking) {
            setTracking(null);
            return;
        }

        getLocalStore("mdPlanTracking").get(id).then(x => {
            if (x) setTracking({ gifts: new Set(x.gifts), themePacks: new Set(x.themePacks) });
            else setTracking({ gifts: new Set(), themePacks: new Set() });
        });
    }

    const resetTracking = () => {
        setTracking({ gifts: new Set(), themePacks: new Set() });
        getLocalStore("mdPlanTracking").remove(id);
    }

    const toggleGift = (giftId, marked) => {
        const newSet = new Set(tracking.gifts);
        if (marked) newSet.delete(Number(giftId));
        else newSet.add(Number(giftId));
        setTracking({ ...tracking, gifts: newSet });
    };

    const toggleThemePack = (themePackId, marked) => {
        const newSet = new Set(tracking.themePacks);
        if (marked) newSet.delete(themePackId);
        else newSet.add(themePackId);
        setTracking({ ...tracking, themePacks: newSet });
    };

    const exports = {
        tracking,
        toggleTracking,
        resetTracking,

        toggleGift,
        toggleThemePack,

        sortMarked, setSortMarked,
        giftsSort, setGiftsSort,
        giftsSeparate, setGiftsSeparate
    }

    return <MdPlanContext.Provider value={exports}>
        {children}
    </MdPlanContext.Provider>;
}

export function useMdPlan() {
    return useContext(MdPlanContext);
}
