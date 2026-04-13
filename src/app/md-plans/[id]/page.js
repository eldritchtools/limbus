"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useEffect, useState } from "react";

import Gift from "@/app/components/gifts/Gift";
import Icon from "@/app/components/icons/Icon";
import KeywordIcon from "@/app/components/icons/KeywordIcon";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import FloorPlan from "@/app/components/mdPlans/FloorPlan";
import GracesDisplay from "@/app/components/mdPlans/GracesDisplay";
import RecommendedBuildsDisplay from "@/app/components/mdPlans/RecommendedBuildsDisplay";
import RecommendedListDisplay from "@/app/components/mdPlans/RecommendedListDisplay";
import RecommendedSpecBuildDisplay from "@/app/components/mdPlans/RecommendedSpecBuildDisplay";
import ContentPageTemplate, { LoadingContentPageTemplate } from "@/app/components/pageTemplates/ContentPageTemplate";
import { keywordIdMapping } from "@/app/database/keywordIds";
import { isLocalId } from "@/app/database/localDB";
import { getMdPlan } from "@/app/database/mdPlans";
import { decodeBuildExtraOpts } from "@/app/lib/buildExtraOpts";
import { contentConfig } from "@/app/lib/contentConfig";
import { mdDiffculties, observeCost } from "@/app/lib/mirrorDungeon";
import { YouTubeThumbnailEmbed } from "@/app/lib/youtube";

export default function MdPlanPage({ params }) {
    const { id } = React.use(params);
    const [plan, setPlan] = useState(null);
    const [identityIds, setIdentityIds] = useState([]);
    const [egoIds, setEgoIds] = useState([]);
    const [extraOpts, setExtraOpts] = useState(null);
    const [loading, setLoading] = useState(true);

    const { isMobile } = useBreakpoint();

    useEffect(() => {
        if (loading) {
            const handlePlan = x => {
                setPlan(x);
                if(x.recommendation_mode === "specbuild") {
                    setIdentityIds(x.identity_ids);
                    setEgoIds(x.ego_ids);
                    setExtraOpts(decodeBuildExtraOpts(x.extra_opts));
                }
                setLoading(false);
            }

            if (isLocalId(id)) {
                contentConfig.md_plans.local.get(Number(id)).then(handlePlan);
            } else {
                getMdPlan(id).then(handlePlan);
            }
        }
    }, [id, loading]);

    if (loading) return <LoadingContentPageTemplate />

    return <ContentPageTemplate
        targetType={"md_plan"} targetId={id} content={plan}
        actions={["like", "save", "edit", "delete"]}
    >
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <span style={{ fontSize: "1.2rem" }}>Difficulty: {mdDiffculties[plan.difficulty].name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: isMobile ? "100%" : "95%", alignSelf: "center", marginBottom: "1rem", gap: "1rem" }}>
            {plan.recommendation_mode === "list" ? <>
                <span style={{ fontSize: "1.2rem" }}>Recommended Identities and E.G.Os</span>
                <RecommendedListDisplay identityIds={plan.identity_ids} egoIds={plan.ego_ids} editable={false} />
            </> :
                null
            }

            {plan.recommendation_mode === "build" ? <>
                <span style={{ fontSize: "1.2rem" }}>Recommended Team Builds</span>
                <RecommendedBuildsDisplay builds={plan.builds} editable={false} />
            </> :
                null
            }

            {plan.recommendation_mode === "specbuild" ? <>
                <span style={{ fontSize: "1.2rem" }}>Recommended Team Build</span>
                <RecommendedSpecBuildDisplay 
                    identityIds={identityIds} setIdentityIds={setIdentityIds}
                    egoIds={egoIds} setEgoIds={setEgoIds}
                    extraOpts={extraOpts} setExtraOpts={setExtraOpts} 
                    editable={false} 
                />
            </> :
                null
            }

            <div style={{ display: "flex", flexDirection: "column", paddingRight: "0.5rem", gap: "0.5rem", width: "100%" }}>
                <span style={{ fontSize: "1.2rem" }}>Description</span>
                <div className={{ maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}>
                    <div>
                        <MarkdownRenderer content={plan.body} />
                    </div>
                </div>
            </div>

            <div style={{ border: "1px #777 solid" }} />

            {plan.grace_levels.some(x => x > 0) ?
                <>
                    <span style={{ fontSize: "1.2rem" }}>Grace of the Stars</span>
                    <span style={{ color: "#aaa" }}>Starting buffs bought with starlight</span>
                    <GracesDisplay graceLevels={plan.grace_levels} />
                </> :
                null
            }

            {plan.start_gift_ids.length > 0 || plan.observe_gift_ids.length > 0 ?
                <>
                    <span style={{ fontSize: "1.2rem" }}>Gifts Setup</span>
                    <span style={{ color: "#aaa" }}>Gifts to start the run with.</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {plan.start_gift_ids.length > 0 ?
                            <div style={{
                                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                                width: isMobile ? "200px" : "300px", padding: "0.2rem", border: "1px #aaa solid", borderRadius: "1rem"
                            }}>
                                <span style={{ fontSize: "1.2rem" }}>Starting Gifts</span>
                                <span style={{ display: "flex", alignItems: "center" }}>
                                    Keyword: <KeywordIcon id={keywordIdMapping[plan.keyword_id]} style={{ height: "32px" }} />
                                </span>
                                <div style={{ display: "flex", flexDirection: "row", gap: "0.2rem" }}>
                                    {plan.start_gift_ids.map(giftId => <Gift key={giftId} id={giftId} scale={isMobile ? 0.6 : 1} />)}
                                </div>
                            </div> :
                            null
                        }
                        {plan.observe_gift_ids.length > 0 ?
                            <div style={{
                                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                                width: isMobile ? "200px" : "300px", padding: "0.2rem", border: "1px #aaa solid", borderRadius: "1rem"
                            }}>
                                <span style={{ fontSize: "1.2rem" }}>Gift Observation</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontWeight: "bold" }}>
                                    <Icon path={"starlight"} style={{ width: "25px", height: "25px" }} />
                                    {observeCost[plan.observe_gift_ids.length]}
                                </div>
                                <div style={{ display: "flex", flexDirection: "row", gap: "0.2rem" }}>
                                    {plan.observe_gift_ids.map(giftId => <Gift key={giftId} id={giftId} scale={isMobile ? 0.6 : 1} />)}
                                </div>
                            </div> :
                            null
                        }
                    </div>
                </> :
                null
            }

            {plan.target_gift_ids.length > 0 ?
                <>
                    <span style={{ fontSize: "1.2rem" }}>Targeted Gifts</span>
                    <span style={{ color: "#aaa" }}>Gifts that should be targeted during the run</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", padding: "0.2rem" }}>
                        {plan.target_gift_ids.map(giftId => <Gift key={giftId} id={giftId} scale={isMobile ? 0.6 : 1} />)}
                    </div>
                </> :
                null
            }

            {plan.floors.length > 0 ?
                <>
                    <span style={{ fontSize: "1.2rem" }}>Floor Plan</span>
                    <FloorPlan floors={plan.floors} />
                </> :
                null
            }

            {plan.youtube_video_id ? <div style={{ display: "flex", paddingTop: "1rem", alignSelf: "center", width: "100%", justifyContent: "center" }}>
                <YouTubeThumbnailEmbed videoId={plan.youtube_video_id} />
            </div> : null}
        </div>
    </ContentPageTemplate>
}
