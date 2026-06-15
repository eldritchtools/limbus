import React, { useState } from "react";

import StatsRadarChart from "./RadarChart";
import { useData } from "../DataProvider";
import Slider from "../objects/Slider";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { useAuth } from "@/app/database/authProvider";
import { deleteReview, getOverallScore, getReviewScores, submitReview } from "@/app/database/reviews";
import { triggerReviewSubmitGAEvent } from "@/app/lib/gaEvents";
import { egoCriteria, identityCriteria } from "@/app/lib/ratings";

export default function RatingComponent({ type, id, globalData, userData, onChange, showReviewsButton, reviewText, setReviewText, isReviewing, setIsReviewing }) {
    const [identities] = useData("identities_mini", "type" === "identity");
    const [egos] = useData("egos_mini", "type" === "ego");
    const { user } = useAuth();
    const [rating, setRating] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const criteria = type === "identity" ? identityCriteria : egoCriteria;

    const rateButton =
        user ?
            <button onClick={() => {
                if (userData) {
                    setRating(userData.rating ?? getReviewScores(userData));
                    setReviewText(userData.review_text ?? "");
                } else {
                    setRating(Array.from({ length: 5 }, () => 0))
                    setReviewText("");
                }
                setIsReviewing(true);
            }}>
                {userData ? "Edit Rating or Review" : "Create Rating or Review"}
            </button> :
            <span>Login to submit a rating</span>

    const submitRating = async rating => {
        setSubmitting(true);

        const result = await submitReview({
            itemType: type,
            itemId: id,
            criteria1: rating[0],
            criteria2: rating[1],
            criteria3: rating[2],
            criteria4: rating[3],
            criteria5: rating[4],
            reviewText: reviewText ?? review?.trim() ?? null,
        });

        triggerReviewSubmitGAEvent(id, (type === "identity" ? identities?.[id]?.name : egos?.[id]?.name) ?? "");
        if(onChange) onChange(result);
        setRating(null);
        setReviewText("");
        setIsReviewing(false);
        setSubmitting(false);
    }

    const deleteRating = async () => {
        setSubmitting(true);
        await deleteReview({ itemType: type, itemId: id });
        if(onChange) onChange(null);
        setSubmitting(false);
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", maxWidth: "100%" }}>
        {globalData ?
            <StatsRadarChart type={type} globalData={globalData.rating} userData={rating ?? userData?.rating ?? getReviewScores(userData)} /> :
            <span>No ratings yet. Be the first to rate this {type === "identity" ? "identity" : "E.G.O"}!</span>
        }
        {
            rating ?
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "0.2rem", textAlign: "center", alignItems: "center" }}>
                        <span>Overall Rating</span>
                        <span>{getOverallScore(rating).toFixed(2)}</span>
                        {
                            criteria.map(({ label, desc }, i) => <React.Fragment key={label}>
                                <div>
                                    <span {...getGeneralTooltipProps(desc)} className="hover-text">{label}</span>
                                </div>
                                <Slider
                                    value={rating[i]} onChange={v => setRating(p => p.map((pv, j) => i === j ? v : pv))}
                                    min={0} max={10} step={1} compressed={true} sliderWidth={75}
                                />
                            </React.Fragment>)
                        }
                    </div>
                    <div>
                        <button onClick={() => { setRating(null); setReviewText(""); setIsReviewing(false); }} disabled={submitting}>Cancel</button>
                        <button onClick={() => submitRating(rating)} disabled={submitting}>Submit Rating</button>
                    </div>
                    <span className="sub-text" style={{textAlign: "center"}}>
                        Ratings with all 0s are not counted in the overall score. 
                        <br/>
                        Submit a review without a rating by leaving all scores at 0.
                    </span>
                </> :
                <>
                    {globalData ?
                        <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "0.5rem", textAlign: "center" }}>
                            <span>Total Votes</span>
                            <span>{globalData.votes}</span>
                            <span>Overall Rating</span>
                            <span>{getOverallScore(globalData.rating).toFixed(2)}</span>
                            {
                                criteria.map(({ label }, i) => <React.Fragment key={label}>
                                    <span>{label}</span>
                                    <span>{globalData.rating[i].toFixed(2)}</span>
                                </React.Fragment>)
                            }
                        </div> :
                        null
                    }
                    <div>
                        {user && userData &&
                            <button onClick={deleteRating} disabled={submitting}>
                                Delete Rating
                            </button>
                        }
                        {rateButton}
                        {showReviewsButton}
                    </div>
                </>
        }
    </div >
}