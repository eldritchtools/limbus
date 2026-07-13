import { useBreakpoint } from "@eldritchtools/shared-components";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import ReactTimeAgo from "react-time-ago";

import StatsRadarChart from "./RadarChart";
import { useData } from "../DataProvider";
import InteractionButton from "./InteractionButton";
import Avatar from "../icons/Avatar";
import EgoIcon from "../icons/EgoIcon";
import IdentityIcon from "../icons/IdentityIcon";
import MarkdownRenderer from "../markdown/MarkdownRenderer";
import { useModal } from "../modals/ModalProvider";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";
import Username from "../user/Username";

import { getReviewScores } from "@/app/database/reviews";
import { sinnerIdMapping } from "@/app/lib/constants";

export default function Review({ type, reviewData, backReview, frontReview, usernameOverride, userAvatarIdOverride, expanded, guardedLinks }) {
    const [identities, identitiesLoading] = useData("identities", reviewData.item_type === "identity");
    const [egos, egosLoading] = useData("egos", reviewData.item_type === "ego");
    const { isMobile } = useBreakpoint();
    const { clearModals } = useModal();
    const router = useRouter();

    const label = useMemo(() => {
        if (!expanded) return null;

        if (reviewData.item_type === "identity") {
            if (identitiesLoading) return null;
            const data = identities[reviewData.item_id];
            return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <span className="title-text">[{sinnerIdMapping[data.sinnerId]}] {data.name}</span>
                <div style={{ display: "flex" }}>
                    <IdentityIcon identity={data} uptie={2} style={{ width: "128px", height: "auto" }} />
                    {!data.tags.includes("Base Identity") &&
                        <IdentityIcon identity={data} uptie={4} style={{ width: "128px", height: "auto" }} />
                    }
                </div>
            </div>
        }

        if (reviewData.item_type === "ego") {
            if (egosLoading) return null;
            const data = egos[reviewData.item_id];
            return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <span className="title-text">[{sinnerIdMapping[data.sinnerId]}] {data.name}</span>
                <EgoIcon ego={data} type={"awaken"} size={128} displayName={true} displayRarity={true} />
            </div>
        }

        return null;
    }, [reviewData, identities, identitiesLoading, egos, egosLoading, expanded]);

    const dataProp = {};
    if (backReview) dataProp.globalData = getReviewScores(backReview);
    if (frontReview) dataProp.userData = getReviewScores(frontReview);

    const username = useMemo(() => usernameOverride ?? reviewData.user?.username, [usernameOverride, reviewData]);
    const avatarId = useMemo(() => userAvatarIdOverride ?? reviewData.user?.avatar_id, [userAvatarIdOverride, reviewData]);

    const goToRanking = () => {
        const params = new URLSearchParams();
        params.set("tab", "reviewer");
        params.set("username", username);

        router.push(`/rankings?${params.toString()}`);
        clearModals();
    }

    return <div className="panel-container">
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.5rem", alignItems: isMobile ? "center" : "start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: expanded ? "350px" : "175px", flex: "0 0 0" }}>
                {expanded ? label : null}
                <StatsRadarChart type={type ?? reviewData.item_type} {...dataProp} includeLabels={expanded ? true : false} scale={expanded ? 1 : 0.5} />
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                    <InteractionButton
                        reviewId={reviewData.id}
                        count={reviewData.upvote_count} type={"upvote"}
                        userId={reviewData.user_id} itemId={reviewData.item_id}
                    />
                    <InteractionButton
                        reviewId={reviewData.id}
                        count={reviewData.funny_count} type={"funny"}
                        userId={reviewData.user_id} itemId={reviewData.item_id}
                    />
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.2rem", textWrap: "wrap" }}>
                    <span>by </span>
                    <Avatar avatarId={avatarId} size={24} style={{ display: "inline" }} />
                    <Username username={username} data={reviewData} guardedLinks={guardedLinks} />
                    <span> • </span>
                    <ReactTimeAgo date={reviewData.updated_at} locale="en-US" timeStyle="mini" />
                    <button
                        className="text-link"
                        style={{ border: "transparent", background: "transparent", padding: 0 }}
                        {...getGeneralTooltipProps("Go to the user's ranking")}
                        onClick={goToRanking}
                    >
                        ➔
                    </button>
                </div>
                {reviewData.review_text && reviewData.review_text.length > 0 ?
                    <MarkdownRenderer content={reviewData.review_text} guardedLinks={guardedLinks} /> :
                    <div className="sub-text">
                        No review provided.
                    </div>
                }
            </div>
        </div>
    </div>
}