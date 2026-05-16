import { useBreakpoint } from "@eldritchtools/shared-components";
import { useMemo } from "react";

import EgoIcon from "../components/icons/EgoIcon";
import IdentityIcon from "../components/icons/IdentityIcon";
import { useModal } from "../components/modals/ModalProvider";
import StatsRadarChart from "../components/ratings/RadarChart";
import { getRatingTooltipProps } from "../components/tooltips/RatingTooltip";

export default function RankingItemDisplay({ type, item, rank, rankingScore, communityScore, communityReviewsRef, userScore, userReviewsRef, showBreakdown, onClick, modalOnChange }) {
    const { openRatingModal } = useModal();
    const { isMobile } = useBreakpoint();
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    const props = communityScore && !isTouchDevice ? getRatingTooltipProps(type, communityScore, userScore) : {};
    const getUserReviews = () => userReviewsRef?.current;
    const getCommunityReviews = () => communityReviewsRef?.current;

    if(onClick)
        props.onClick = () => onClick();
    else if(modalOnChange)
        props.onClick = () => openRatingModal({
            type: type, id: item.id,
            getCommunityReviews: getCommunityReviews, getUserReviews: getUserReviews, onChange: modalOnChange
        })

    const icon = useMemo(() => {
        return <div style={{ position: "relative", width: "100%" }}>
            {type === "identity" ?
                <IdentityIcon identity={item} uptie={4} displayName={true} displayRarity={true} /> :
                <EgoIcon ego={item} type={"awaken"} displayName={true} displayRarity={true} />
            }
            {rank && <div style={{
                position: "absolute", top: 5, right: 5,
                padding: "2px 4px", borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(6px)",
                fontWeight: "bold", fontSize: "1.2rem", lineHeight: 1, color: "#ddd"
            }}>
                #{rank}
            </div>
            }
        </div>
    },
        [type, item, rank]
    )

    const ratingsComponent = <span style={{ textAlign: "center" }}>User Ratings: {communityScore?.votes ?? 0}</span>;

    if (!rank)
        return <div {...props} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
            {icon}
            {ratingsComponent}
        </div>;

    const scoreComponent = <span style={{ textAlign: "center" }}>Score: {rankingScore.toFixed(2)}</span>;
    const size = isMobile ? 92 : 128;
    const scale = isMobile ? 0.5 : 0.7;

    if (showBreakdown)
        return <div {...props}
            style={{ display: "grid", gridTemplateColumns: `repeat(2, ${size}px)`, alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
            {icon}
            <StatsRadarChart type={type} globalData={communityScore?.rating} userData={userScore?.rating} includeLabels={false} scale={scale} />
            {ratingsComponent}
            {scoreComponent}
        </div>
    else
        return <div {...props} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", cursor: "pointer" }}>
            {icon}
            {scoreComponent}
            {ratingsComponent}
        </div>
}