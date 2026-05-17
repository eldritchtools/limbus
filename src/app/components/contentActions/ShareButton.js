"use client";

import { useEffect, useRef, useState } from "react";

import ActionTemplate from "./ActionTemplate";
import { ShareSolid } from "./Symbols";
import { useSiteCustomization } from "../SiteCustomizationProvider";

import { triggerShareGAEvent } from "@/app/lib/gaEvents";

export default function ShareButton({ targetType, targetId, title, iconSize }) {
    const { getCustomizationValue } = useSiteCustomization();
    const [message, setMessage] = useState(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    const showMessage = (msg) => {
        setMessage(msg);

        clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(
            () => setMessage(null),
            3000
        );
    };

    const handleShare = async () => {
        triggerShareGAEvent(targetType, targetId);

        try {
            if (navigator.share && !getCustomizationValue("disableShareMenu")) {
                await navigator.share({ title, url: window.location.href });
                return;
            }

            await navigator.clipboard.writeText(window.location.href);
            showMessage("Link Copied!");
        } catch (err) {
            if (err?.name === "AbortError") return;

            showMessage("Unable to Share");
        }
    };

    return <ActionTemplate type="button" onClick={handleShare}>
        <ShareSolid text={message ?? "Share"} size={iconSize} />
    </ActionTemplate>
}
