import { useEffect, useState } from "react";

import ActionTemplate from "./ActionTemplate";
import { LikeOutline, LikeSolid } from "./Symbols";
import { useAuth } from "../database/authProvider";
import { useRequestsCache } from "../database/RequestsCacheProvider";

export default function LikeButton({ targetType, targetId, likeCount, type = "button", iconSize, shortText = false }) {
    const { user } = useAuth();
    const { checkLiked, toggleLike, fetchUserData } = useRequestsCache();
    const [count, setCount] = useState(likeCount);
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (user) fetchUserData(targetType, [targetId]) }, [fetchUserData, targetType, targetId, user]);
    const liked = useMemo(() => checkLiked(targetType, targetId), [checkLiked, targetType, targetId]);
    const text = shortText ? `${count}` : count === 1 ? "1 Like" : `${count} Likes`;
    const component = liked ? <LikeSolid text={text} size={iconSize} /> : <LikeOutline text={text} size={iconSize} />

    const handleClick = async () => {
        setLoading(true);
        await toggleLike(targetType, targetId);
        setLoading(false);

        if (liked) setCount(p => p - 1);
        else setCount(p => p + 1);
    };

    if (!user)
        return <ActionTemplate type={type} disabled={true}>
            {component}
        </ActionTemplate>
    else
        return <ActionTemplate type={type} active={liked} disabled={loading} onClick={handleClick}>
            {component}
        </ActionTemplate>
}
