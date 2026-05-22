"use client";

import { useEffect, useState } from "react";

import { BellOutline, BellSolid } from "./Symbols";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { useAuth } from "@/app/database/authProvider";
import { useRequestsCache } from "@/app/database/RequestsCacheProvider";

export default function FollowButton({ targetId }) {
    const { checkFollowed, toggleFollowed } = useRequestsCache();
    const { user } = useAuth();
    const [followed, setFollowed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setFollowed(await checkFollowed(targetId));
        }

        load();
    }, [user, targetId, checkFollowed]);

    if (!user) return null;

    const component = followed ? <BellSolid size={16} /> : <BellOutline size={16} />

    const handleClick = async () => {
        setLoading(true);
        await toggleFollowed(targetId);
        setFollowed(p => !p);
        setLoading(false);
    };

    return <button
        {...getGeneralTooltipProps("Follow to get a notification whenever this user makes a new post.")}
        style={{ background: "transparent", border: "transparent", padding: 0 }}
        disabled={loading} onClick={handleClick}
    >
        {component}
    </button>
}
