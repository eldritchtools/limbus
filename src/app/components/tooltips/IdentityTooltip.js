"use client";

import { isTouchDevice } from "@eldritchtools/shared-components";
import { useEffect, useMemo, useState } from "react";

import TooltipTemplate from "./TooltipTemplate";
import { useData } from "../DataProvider";
import IdentityIcon from "../icons/IdentityIcon";
import KeywordIcon from "../icons/KeywordIcon";
import NoPrefetchLink from "../NoPrefetchLink";
import StatsRadarChart from "../ratings/RadarChart";
import { useSiteCustomization } from "../SiteCustomizationProvider";

import { useAuth } from "@/app/database/authProvider";
import { getAggregatesByType, getUserReviews } from "@/app/database/reviews";

const TOOLTIP_ID = "identity-tooltip";

function IdentityTooltipContent({ identity, forceRatings }) {
    const { getCustomizationValue } = useSiteCustomization();
    const [rating, setRating] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const { user } = useAuth();

    const showRatings = useMemo(() => {
        return forceRatings ? (forceRatings === "show") : getCustomizationValue("ratingsOnTooltips");
    }, [getCustomizationValue, forceRatings]);

    useEffect(() => {
        if (!showRatings) return;

        const fetchRating = async () => {
            setRating(null);
            setUserRating(null);
            const rating = (await getAggregatesByType({ itemType: "identity" }))[identity.id];
            setRating(rating);
            if (user) {
                const userRating = (await getUserReviews({ userId: user.id, itemType: "identity" }))[identity.id];
                setUserRating(userRating);
            }
        }

        fetchRating();
    }, [showRatings, identity, user]);

    console.log(rating, userRating);

    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", height: "128px" }}>
            <div>
                <IdentityIcon identity={identity} uptie={4} displayName={true} displayRarity={true} style={{ width: "128px", height: "128px" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", width: "192px" }}>
                <div style={{ flex: 1, display: "flex" }}>
                    {(identity.skillKeywordList || []).map(x => <KeywordIcon key={x} id={x} />)}
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                    {identity.affinities.map(x => <KeywordIcon key={x} id={x} />)}
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                    {identity.types.map(x => <KeywordIcon key={x} id={x} />)}
                </div>
            </div>
        </div>
        {showRatings && rating && <>
            <StatsRadarChart type={"identity"} globalData={rating?.rating} userData={userRating?.rating} includeHelp={false} />
            <div style={{ display: "flex", textAlign: "center" }}>
                <span style={{ flex: 1 }}>Votes: {rating.votes}</span>
                <span style={{ flex: 1 }}>Rating: {rating.overallRating.toFixed(2)}</span>
            </div>
        </>
        }
        {isTouchDevice() ? <NoPrefetchLink href={`/identities/${identity.id}`} style={{ alignSelf: "center", fontSize: "1.2rem" }}>Go to page</NoPrefetchLink> : null}
    </div>
}

function TooltipLoader({ id, forceRatings }) {
    const [identities, identitiesLoading] = useData("identities_mini");
    if (!id || identitiesLoading || !(id in identities)) return null;

    return <IdentityTooltipContent identity={identities[id]} forceRatings={forceRatings} />
}

export default function IdentityTooltip() {
    return <TooltipTemplate id={TOOLTIP_ID}
        contentFunc={content => {
            if (!content) return null;
            const [id, forceRatings] = content.split("|");
            return forceRatings ?
                <TooltipLoader id={id} forceRatings={forceRatings} /> :
                <TooltipLoader id={id} />
        }}
        clickable={isTouchDevice()}
    />
}

export function getIdentityTooltipProps(id, forceRatings) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": forceRatings ? `${id}|${forceRatings}` : id,
    }
}