"use client";

import { isTouchDevice } from "@eldritchtools/shared-components";
import { useEffect, useMemo, useState } from "react";

import NoPrefetchLink from "../NoPrefetchLink";
import TooltipTemplate from "./TooltipTemplate";
import { useSkillData } from "../dataHooks/skills";
import { useData } from "../DataProvider";
import EgoIcon from "../icons/EgoIcon";
import KeywordIcon from "../icons/KeywordIcon";
import Status from "../objects/Status";
import StatsRadarChart from "../ratings/RadarChart";
import { useSiteCustomization } from "../SiteCustomizationProvider";
import { AtkWeight } from "../skill/AtkWeight";

import { useAuth } from "@/app/database/authProvider";
import { getAggregatesByType, getUserReviews } from "@/app/database/reviews";

export const EGO_TOOLTIP_ID = "ego-tooltip";

function EgoTooltipContent({ id, ego, uptie = 4, forceRatings }) {
    const { awakeningSkills, corrosionSkills } = useSkillData("ego", id, uptie);
    const types = [];

    types.push(ego.awakeningType.affinity);
    if (ego.corrosionType && ego.awakeningType.affinity !== ego.corrosionType.affinity)
        types.push(ego.corrosionType.affinity);

    types.push(ego.awakeningType.type);
    if (ego.corrosionType && ego.awakeningType.type !== ego.corrosionType.type)
        types.push(ego.corrosionType.type);

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
            const rating = (await getAggregatesByType({ itemType: "ego" }))[id];
            setRating(rating);
            if (user) {
                const userRating = (await getUserReviews({ userId: user.id, itemType: "ego" }))[id];
                setUserRating(userRating);
            }
        }

        fetchRating();
    }, [showRatings, id, user]);

    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem" }}>
        {getCustomizationValue("showIdsOnTooltips") && <span className="title-text" style={{textAlign: "center"}}>{ego.id}</span>}
        <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
            <div><EgoIcon ego={ego} type={"awaken"} displayName={true} displayRarity={true} style={{ width: "128px", height: "128px" }} /></div>
            <div style={{ display: "flex", flexDirection: "column", width: "192px", minHeight: "128px" }}>
                {awakeningSkills.length > 0 ?
                    <div style={{ display: "flex", gap: "0.2rem", alignItems: "center", paddingLeft: "0.2rem", paddingBottom: "0.2rem" }}>
                        Atk #:
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                {awakeningSkills.map((skill, i) => <AtkWeight key={i} skillData={skill.data} />)}
                            </div>
                            {corrosionSkills.length > 0 ?
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    {corrosionSkills.map((skill, i) => <AtkWeight key={i} skillData={skill.data} />)}
                                </div> :
                                null
                            }
                        </div>
                    </div> :
                    null
                }
                <div style={{ flex: 1, display: "flex" }}>
                    {types.map(x => <KeywordIcon key={x} id={x} />)}
                </div>
                <div style={{ flex: 1, display: "flex", flexWrap: "wrap" }}>
                    {ego.statuses.sort().map(x => <Status key={x} id={x} includeTooltip={false} includeName={false} />)}
                </div>
                <div style={{ flex: 1, display: "flex", flexWrap: "wrap" }}>
                    {Object.entries(ego.cost).map(([affinity, cost]) => <div key={affinity} style={{ display: "flex", alignItems: "center" }}>
                        <KeywordIcon id={affinity} />
                        <span>x{cost}</span>
                    </div>)}
                </div>
            </div>
        </div>
        {showRatings &&
            (rating ? <>
            <StatsRadarChart type={"ego"} globalData={rating?.rating} userData={userRating?.rating} includeHelp={false} />
                <div style={{ display: "flex", textAlign: "center" }}>
                    <span style={{ flex: 1 }}>Votes: {rating.votes}</span>
                    <span style={{ flex: 1 }}>Rating: {rating.overallRating.toFixed(2)}</span>
                </div>
            </> :
                <div style={{color: "var(--secondary-text-color)", textAlign: "center"}}>Loading...</div>
            )
        }
        {isTouchDevice() ? <NoPrefetchLink href={`/egos/${ego.id}`} style={{ alignSelf: "center", fontSize: "1.2rem" }}>Go to page</NoPrefetchLink> : null}
    </div>
}

function TooltipLoader({ id, uptie, forceRatings }) {
    const [egos, egosLoading] = useData("egos");
    if (!id || egosLoading || !(id in egos)) return null;

    const props = {
        id: id,
        ego: egos[id],
        uptie: uptie,
        forceRatings: forceRatings
    }

    return <EgoTooltipContent {...props} />
}

export default function EgoTooltip() {
    return <TooltipTemplate id={EGO_TOOLTIP_ID} contentFunc={content => {
        if (!content) return null;
        const parts = content.split("|");
        const props = { id: parts[0] };
        parts.forEach((part, i) => {
            if (i === 0) return;
            if (!isNaN(part)) props.uptie = Number(part);
            if (part === "show" || part === "hide") props.forceRatings = part;
        })

        return <TooltipLoader {...props} />
    }} clickable={isTouchDevice()} />
}

export function getEgoTooltipProps(id, forceRatings) {
    return {
        "data-tooltip-id": EGO_TOOLTIP_ID,
        "data-tooltip-content": forceRatings ? `${id}|${forceRatings}` : id,
    }
}
