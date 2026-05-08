"use client";

import TooltipTemplate from "./TooltipTemplate";
import StatsRadarChart from "../ratings/RadarChart";

const TOOLTIP_ID = "rating-tooltip";

function RatingTooltipContent({ ratings }) {
    const [type, community, user] = ratings.split("|");
    const communityRatings = community.length > 0 ? community.split(",").map(x => Number(x)) : null;
    const userRatings = user.length > 0 ? user.split(",").map(x => Number(x)) : null;

    return <div>
        <StatsRadarChart type={type} globalData={communityRatings} userData={userRatings} />
    </div>;
}


export default function RatingTooltip() {
    return <TooltipTemplate id={TOOLTIP_ID} contentFunc={ratings => <RatingTooltipContent ratings={ratings} />} />
}

export function getRatingTooltipProps(type, communityRating, userRating) {
    const community = communityRating ? communityRating.rating.join(",") : "";
    const user = userRating ? userRating.rating.join(",") : "";

    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": `${type}|${community}|${user}`
    }
}