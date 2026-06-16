import { FaceSmileIcon as FaceSmileIconOutline, HandThumbUpIcon as HandThumbUpIconOutline } from "@heroicons/react/24/outline";
import { FaceSmileIcon as FaceSmileIconSolid, HandThumbUpIcon as HandThumbUpIconSolid } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

import styles from "./InteractionButton.module.css";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { useAuth } from "@/app/database/authProvider";
import { getReviewInteraction, toggleReviewFunny, toggleReviewUpvote } from "@/app/database/reviews";
import { triggerReviewInteractionGAEvent } from "@/app/lib/gaEvents";

export default function InteractionButton({ reviewId, count, type, userId, itemId }) {
    const { user } = useAuth();
    const [state, setState] = useState(false);
    const [delta, setDelta] = useState(0);

    const handleClick = async () => {
        if (type === "upvote") {
            const result = await toggleReviewUpvote(reviewId);
            if (delta === 0) setDelta(result.upvote ? 1 : -1);
            else setDelta(0);
        } else if (type === "funny") {
            const result = await toggleReviewFunny(reviewId);
            if (delta === 0) setDelta(result.funny ? 1 : -1);
            else setDelta(0);
        }

        setState(p => !p);
        triggerReviewInteractionGAEvent(itemId, user?.id, reviewId, userId);
    }

    let opacity = 0;
    if (count || delta)
        opacity = Math.min(0.25 + 0.75 * ((count + delta) / 10), 1);

    let disabled = !user || user.id === userId;

    useEffect(() => {
        const getInteraction = async () => {
            const data = await getReviewInteraction(reviewId);
            if (type === "upvote") setState(data.upvote);
            else if (type === "funny") setState(data.funny);
        }

        if(user) getInteraction();
    }, [reviewId, type, user]);

    const icon = useMemo(() => {
        const style = { width: "20px", height: "20px" };
        if (type === "upvote") {
            if (state) return <HandThumbUpIconSolid style={style} />
            else return <HandThumbUpIconOutline style={style} />
        } else if (type === "funny") {
            if (state) return <FaceSmileIconSolid style={style} />
            else return <FaceSmileIconOutline style={style} />
        }
    }, [type, state]);

    return <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
        <button
            {...getGeneralTooltipProps(type === "upvote" ? "Upvote" : "Funny")}
            onClick={handleClick}
            style={{
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: (disabled) ? 0.5 : 1,
            }}
            className={styles.interactionButton}
            disabled={disabled}
        >
            {icon}
        </button>
        <span style={{ opacity: opacity }}>
            {count + delta}
        </span>
    </div>
}