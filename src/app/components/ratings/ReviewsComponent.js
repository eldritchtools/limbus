import { useEffect, useState } from "react";
import ReactTimeAgo from "react-time-ago";

import BumpArrow from "./BumpArrow";
import StatsRadarChart from "./RadarChart";
import MarkdownRenderer from "../markdown/MarkdownRenderer";
import Username from "../user/Username";

import { useAuth } from "@/app/database/authProvider";
import { defaultReviewsPageSize, getItemReviews, getReviewScores } from "@/app/database/reviews";

export default function ReviewsComponent({ type, id, sortType }) {
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReviews = async () => {
            setLoading(true);
            const fetchedReviews = await getItemReviews({ itemType: type, itemId: id, page: page, sortType: sortType });

            setReviews(fetchedReviews);
            setLoading(false);
        }

        loadReviews();
    }, [type, id, page, sortType]);

    if (loading)
        return <span style={{ color: "var(--disabled-text-color)", textAlign: "center", minWidth: "min(480px, 100%)", flex: 1 }}>
            Loading Reviews...
        </span>;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "min(480px, 100%)", flex: 1 }}>
        {
            reviews.map(review => <div key={review.id} className="panel-container">
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <StatsRadarChart type={"identity"} userData={getReviewScores(review)} includeLabels={false} scale={.5} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.25rem", textWrap: "wrap" }}>
                            {user && <BumpArrow reviewId={review.id} />}
                            <span> by </span>
                            <Username username={review.user?.username} data={review} />
                            <span> • </span>
                            <ReactTimeAgo date={review.updated_at} locale="en-US" timeStyle="mini" />
                        </div>
                        <MarkdownRenderer content={review.review_text} />
                    </div>
                </div>
            </div>)
        }
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", alignSelf: "end" }}>
            <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            {page}
            <button className="page-button" disabled={reviews.length < defaultReviewsPageSize} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
    </div>
}