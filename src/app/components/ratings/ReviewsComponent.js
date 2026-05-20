import { useEffect, useState } from "react";

import Review from "./Review";

import { useAuth } from "@/app/database/authProvider";
import { defaultReviewsPageSize, getItemReviews } from "@/app/database/reviews";

export default function ReviewsComponent({ type, id, sortType, userReview }) {
    const { user, profile } = useAuth();
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
        {userReview?.review_text &&
            <Review type={type} reviewData={userReview} backReview={userReview} usernameOverride={profile?.username} userAvatarIdOverride={profile?.avatar_id} />
        }
        {user &&
            <span className="sub-text" style={{ textAlign: "center" }}>
                If you find a review helpful, you can bump it to help increase its visibility in the Active and Top tabs.
            </span>
        }
        {
            reviews.map(review => <Review key={review.id} type={type} reviewData={review} backReview={review} />)
        }
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", alignSelf: "end" }}>
            <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            {page}
            <button className="page-button" disabled={reviews.length < defaultReviewsPageSize} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
    </div>
}