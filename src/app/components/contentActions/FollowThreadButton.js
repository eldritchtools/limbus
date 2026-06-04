"use client";

import { useEffect, useState } from "react";

import { BellOutline, BellSolid } from "./Symbols";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { useAuth } from "@/app/database/authProvider";
import { useRequestsCache } from "@/app/database/RequestsCacheProvider";

export default function FollowThreadButton({ targetType, targetId, style }) {
    const { checkFollowedThread, toggleFollowedThread } = useRequestsCache();
    const { user } = useAuth();
    const [followed, setFollowed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setFollowed(await checkFollowedThread(targetType, targetId));
        }

        load();
    }, [user, targetType, targetId, checkFollowedThread]);

    if (!user) return null;

    const component = followed ? <BellSolid size={16} /> : <BellOutline size={16} />

    const handleClick = async () => {
        setLoading(true);
        await toggleFollowedThread(targetType, targetId);
        setFollowed(p => !p);
        setLoading(false);
    };

    return <button
        {...getGeneralTooltipProps("Follow to get a notification whenever someone leaves a comment on this comment thread.")}
        style={{ background: "transparent", border: "transparent", padding: 0, ...style }}
        disabled={loading} onClick={handleClick}
    >
        {component}
    </button>
}
