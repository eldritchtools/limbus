import { useEffect, useMemo, useState } from "react";

import styles from "./BumpArrow.module.css";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { bumpReview } from "@/app/database/reviews";
import { uiColors } from "@/app/lib/colors";

const COOLDOWN_MS = 10 * 60 * 1000;
let lastBumpAt = null;
let listeners = new Set();

function emit() {
    for (const l of listeners) l(lastBumpAt);
}

function setLastBumpAt(time) {
    lastBumpAt = time ? new Date(time).getTime() : null;
    emit();
}

function isOnCooldown(lastBumpAt) {
    return lastBumpAt && (Date.now() - lastBumpAt < COOLDOWN_MS);
}

function subscribe(callback) {
    listeners.add(callback);
    callback(lastBumpAt);

    return () => listeners.delete(callback);
}

function useBumpCooldown() {
    const [lastBumpAt, setLastBumpAtState] = useState(null);

    useEffect(() => {
        return subscribe(setLastBumpAtState);
    }, []);

    return isOnCooldown(lastBumpAt);
}

function getCooldownText(lastBumpAt) {
    if (!lastBumpAt) return null;

    const remaining = COOLDOWN_MS - (Date.now() - lastBumpAt);
    if (remaining <= 0) return null;

    const seconds = Math.ceil(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `Next bump available in ${minutes > 0 ? `${minutes}:${secs.toString().padStart(2, "0")}` : `${secs}s`}`;
}

function getTooltipText(lastBumpAt) {
    const cooldownText = getCooldownText(lastBumpAt);

    return cooldownText
        ? `Reviews can be "bumped" to increase their visibility in the Active and Top tabs.\nTo limit possible spam or abuse, bumps are limited to once every 10 minutes.\n${cooldownText}`
        : `Reviews can be "bumped" to increase their visibility in the Active and Top tabs.\nTo limit possible spam or abuse, bumps are limited to once every 10 minutes.`;
}

export default function BumpArrow({ reviewId }) {
    const [status, setStatus] = useState("idle");
    const [hovered, setHovered] = useState(false);
    const [, setTick] = useState(0);
    const [tooltip, setTooltip] = useState(getTooltipText(lastBumpAt));
    const onCooldown = useBumpCooldown();

    async function handleClick() {
        if (onCooldown) {
            setStatus("cooldown");
            setTimeout(() => setStatus("idle"), 600);
            return;
        }

        let res = await bumpReview(reviewId);
        if (Array.isArray(res)) res = res[0];

        // update global cooldown state
        setLastBumpAt(res.last_bump_at);

        setStatus(res.success ? "success" : "cooldown");
        setTimeout(() => setStatus("idle"), 800);
    }

    useEffect(() => {
        if (!hovered) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTooltip(getTooltipText(lastBumpAt));

        const interval = setInterval(() => {
            setTick(t => t + 1);
            setTooltip(getTooltipText(lastBumpAt));
        }, 1000);

        return () => clearInterval(interval);
    }, [hovered]);

    const color =
        status === "success"
            ? uiColors.green
            : status === "cooldown"
                ? uiColors.red
                : "#a1a1aa";

    return (
        <button
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            {...getGeneralTooltipProps(tooltip)}
            onClick={handleClick}
            style={{
                color,
                cursor: onCooldown ? "not-allowed" : "pointer",
                opacity: (onCooldown && status === "idle") ? 0.5 : 1,
            }}
            className={styles.bumpArrow}
        >
            <svg viewBox="6 6 12 12" fill="currentColor">
                <path d="M12 6l5 5h-3v7h-4v-7H7z" />
            </svg>
        </button>
    );
}