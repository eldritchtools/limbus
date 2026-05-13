import { useBreakpoint } from "@eldritchtools/shared-components";
import ReactTimeAgo from "react-time-ago";

import BumpArrow from "./BumpArrow";
import StatsRadarChart from "./RadarChart";
import { useData } from "../DataProvider";
import EgoIcon from "../icons/EgoIcon";
import IdentityIcon from "../icons/IdentityIcon";
import MarkdownRenderer from "../markdown/MarkdownRenderer";
import Username from "../user/Username";

import { useAuth } from "@/app/database/authProvider";
import { getReviewScores } from "@/app/database/reviews";
import { sinnerIdMapping } from "@/app/lib/constants";

export default function Review({ type, reviewData, backReview, frontReview, usernameOverride, expanded }) {
    const { user } = useAuth();
    const [identities, identitiesLoading] = useData("identities", reviewData.item_type === "identity");
    const [egos, egosLoading] = useData("egos", reviewData.item_type === "ego");
    const { isMobile } = useBreakpoint();

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

    return <div className="panel-container">
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.5rem", alignItems: isMobile ? "center" : "start" }}>
            {expanded ?
                <div style={{ display: "flex", flexDirection: "column", width: "350px" }}>
                    {label}
                    <StatsRadarChart type={type ?? reviewData.item_type} {...dataProp} includeLabels={true} scale={1} />
                </div> :
                <StatsRadarChart type={type ?? reviewData.item_type} {...dataProp} includeLabels={false} scale={.5} />
            }
            <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.25rem", textWrap: "wrap" }}>
                    {user && <BumpArrow reviewId={reviewData.id} />}
                    <span> by </span>
                    <Username username={usernameOverride ?? reviewData.user?.username} data={reviewData} />
                    <span> • </span>
                    <ReactTimeAgo date={reviewData.updated_at} locale="en-US" timeStyle="mini" />
                </div>
                {reviewData.review_text && reviewData.review_text.length > 0 ?
                    <MarkdownRenderer content={reviewData.review_text} /> :
                    <div className="sub-text">
                        No review provided.
                    </div>
                }
            </div>
        </div>
    </div>
}