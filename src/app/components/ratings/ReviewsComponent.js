import { useEffect, useState } from "react";
import ReactTimeAgo from "react-time-ago";

import StatsRadarChart from "./RadarChart";
import MarkdownRenderer from "../markdown/MarkdownRenderer";
import Username from "../user/Username";

import { defaultReviewsPageSize, getItemReviews, getReviewScores } from "@/app/database/reviews";

export default function ReviewsComponent({type, id}) {
    const [page, setPage] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReviews = async () => {
            setLoading(true);
            const fetchedReviews = await getItemReviews({ itemType: type, itemId: id, page: page });

            setReviews(fetchedReviews);
            setLoading(false);
        }

        loadReviews();
    }, [type, id, page]);

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
                        <span>by <Username username={review.user?.username} data={review} /> • <ReactTimeAgo date={review.updated_at} locale="en-US" timeStyle="mini" /></span>
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