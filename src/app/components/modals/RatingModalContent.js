"use client";

import { useCallback, useState } from "react";

import { useData } from "../DataProvider";
import RatingComponent from "../ratings/RatingComponent";
import ReviewsComponent from "../ratings/ReviewsComponent";

import { sinnerIdMapping } from "@/app/lib/constants";

export default function RatingModalContent({ type, id, getCommunityReviews, getUserReviews, onChange }) {
    const [identities, identitiesLoading] = useData("identities_mini")
    const [egos, egosLoading] = useData("egos_mini");
    const [, updateCount] = useState(0);

    const triggerRender = useCallback(() => { updateCount(p => p + 1) }, []);

    const handleChange = async x => {
        await onChange(x);

        setTimeout(() => {
            triggerRender();
        }, 0);
    }

    const review = getUserReviews()?.[id];
    const communityRating = getCommunityReviews()?.[id];

    const name = type === "identity" ?
        (identitiesLoading ? "" : `[${sinnerIdMapping[identities[id].sinnerId]}] ${identities[id].name}`) :
        (egosLoading ? "" : `[${sinnerIdMapping[egos[id].sinnerId]}] ${egos[id].name}`)

    return <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem", maxHeight: "80vh" }}>
        <div style={{ maxWidth: "min(350px, 100%)" }}>
            <h2 className="title-text" style={{ textAlign: "center" }}>{name}</h2>
            <RatingComponent type={type} id={id} globalData={communityRating} userData={review} onChange={handleChange} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", minWidth: "min(480px, 90vw)", flex: 1, overflowY: "auto" }}>
            <h2 className="title-text">Reviews</h2>
            <ReviewsComponent type={type} id={id} />
        </div>
    </div>
}