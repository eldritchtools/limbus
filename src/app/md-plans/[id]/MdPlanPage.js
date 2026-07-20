import React from "react";

import FloorPlanServer from "./FloorPlanServer";
import styles from "./MdPlan.module.css";
import { GiftList, SkillReplaceIdWrapper, TargetGifts, TrackingButtons } from "./MdPlanPageComponents";
import { MdPlanProvider } from "./MdPlanProvider";

import Icon from "@/app/components/icons/Icon";
import KeywordIcon from "@/app/components/icons/KeywordIcon";
import MarkdownRendererServer from "@/app/components/markdown/MarkdownRendererServer";
import AdversitiesDisplay, { AdversitiesPointTotal } from "@/app/components/mdPlans/AdversitiesDisplay";
import GracesDisplay from "@/app/components/mdPlans/GracesDisplay";
import RecommendedBuildsDisplay from "@/app/components/mdPlans/RecommendedBuildsDisplay";
import RecommendedListDisplay from "@/app/components/mdPlans/RecommendedListDisplay";
import RecommendedSpecBuildDisplay from "@/app/components/mdPlans/RecommendedSpecBuildDisplay";
import { HorizontalDivider } from "@/app/components/objects/Dividers";
import ImageCarousel from "@/app/components/objects/ImageCarousel";
import ContentPageTemplate from "@/app/components/pageTemplates/ContentPageTemplate";
import SkillReplace from "@/app/components/skill/SkillReplace";
import { keywordIdMapping } from "@/app/database/keywordIds";
import { decodeBuildExtraOpts } from "@/app/lib/buildExtraOpts";
import { mdDiffculties, observeCost } from "@/app/lib/mirrorDungeon";
import { YouTubeThumbnailEmbed } from "@/app/lib/youtube";

function TeamDisplay({ plan, extraOpts }) {
    if (plan.recommendation_mode === "list")
        return <>
            <span style={{ fontSize: "1.2rem" }}>Recommended Identities and E.G.Os</span>
            <RecommendedListDisplay identityIds={plan.identity_ids} egoIds={plan.ego_ids} skillReplaces={extraOpts?.skillReplaces} editable={false} />
        </>

    if (plan.recommendation_mode === "build")
        return <>
            <span style={{ fontSize: "1.2rem" }}>Recommended Team Builds</span>
            <RecommendedBuildsDisplay builds={plan.builds} editable={false} />
        </>

    if (plan.recommendation_mode === "specbuild")
        return <>
            <span style={{ fontSize: "1.2rem" }}>Recommended Team Build</span>
            <RecommendedSpecBuildDisplay
                identityIds={plan.identity_ids} egoIds={plan.ego_ids}
                extraOpts={extraOpts} editable={false}
            />
        </>

    return null;
}

export default function MdPlanPage({ id, plan, giftsData, themePacksData }) {
    const extraOpts = decodeBuildExtraOpts(plan.extra_opts) ?? "";

    return <ContentPageTemplate
        targetType={"md_plan"} targetId={id} content={plan}
        actions={["like", "save", "share", "edit", "delete"]}
    >
        <MdPlanProvider id={id}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <span style={{ fontSize: "1.2rem" }}>Difficulty: {mdDiffculties[plan.difficulty].name}</span>
            </div>
            <div className={styles.mdPlan}>
                <TeamDisplay plan={plan} extraOpts={extraOpts} />

                {plan?.body?.length > 0 && <>
                    <span style={{ fontSize: "1.2rem" }}>Description</span>
                    <div className={{ maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}>
                        <MarkdownRendererServer content={plan.body} />
                    </div>
                </>
                }

                {plan?.image_ids?.length > 0 && <>
                    <span style={{ fontSize: "1.2rem" }}>Images</span>
                    <ImageCarousel imageIds={plan.image_ids} />
                </>
                }

                <HorizontalDivider />

                <TrackingButtons />

                {plan.recommendation_mode === "build" && extraOpts?.skillReplaces && <>
                    <span style={{ fontSize: "1.2rem" }}>Skill Replacements</span>
                    <span className="sub-text">Skills to replace on recommended identities.</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxWidth: "100%" }}>
                        {Object.entries(extraOpts.skillReplaces).map(([id, counts]) =>
                            <div key={id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                                <SkillReplaceIdWrapper id={id} />
                                <SkillReplace counts={counts} />
                            </div>)}
                    </div>
                </>
                }

                {plan.grace_levels.some(x => x > 0) &&
                    <>
                        <span style={{ fontSize: "1.2rem" }}>Grace of the Stars</span>
                        <span className="sub-text">Starting buffs bought with starlight</span>
                        <GracesDisplay graceLevels={plan.grace_levels} />
                    </>
                }

                {plan.difficulty === "E" && plan.adversities && Object.keys(plan.adversities).length > 0 &&
                    <>
                        <span style={{ fontSize: "1.2rem" }}>Adversities: <AdversitiesPointTotal adversities={plan.adversities} /></span>
                        <span className="sub-text">Adversities to take in the Extreme floors</span>
                        <AdversitiesDisplay adversities={plan.adversities} />
                    </>
                }

                {(plan.start_gift_ids.length > 0 || plan.observe_gift_ids.length > 0) &&
                    <>
                        <span style={{ fontSize: "1.2rem" }}>Gifts Setup</span>
                        <span className="sub-text">Gifts to start the run with.</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {plan.start_gift_ids.length > 0 ?
                                <div className={`panel-container ${styles.giftPanel}`}>
                                    <span style={{ fontSize: "1.2rem" }}>Starting Gifts</span>
                                    <span style={{ display: "flex", alignItems: "center" }}>
                                        Keyword: <KeywordIcon id={keywordIdMapping[plan.keyword_id]} style={{ height: "32px" }} />
                                    </span>
                                    <GiftList giftIds={plan.start_gift_ids} giftsData={giftsData} />
                                </div> :
                                null
                            }
                            {plan.observe_gift_ids.length > 0 ?
                                <div className={`panel-container ${styles.giftPanel}`}>
                                    <span style={{ fontSize: "1.2rem" }}>Gift Observation</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontWeight: "bold" }}>
                                        <Icon path={"starlight"} style={{ width: "25px", height: "25px" }} />
                                        {observeCost[plan.observe_gift_ids.length]}
                                    </div>
                                    <GiftList giftIds={plan.observe_gift_ids} giftsData={giftsData} />
                                </div> :
                                null
                            }
                        </div>
                    </>
                }

                {plan.target_gift_ids.length > 0 &&
                    <>
                        <span style={{ fontSize: "1.2rem" }}>Targeted Gifts</span>
                        <span className="sub-text">Gifts that should be targeted during the run</span>
                        <TargetGifts giftIds={plan.target_gift_ids} giftsData={giftsData} />
                    </>
                }

                {plan.floors.length > 0 &&
                    <>
                        <span style={{ fontSize: "1.2rem" }}>Floor Plan</span>
                        <FloorPlanServer floors={plan.floors} giftsData={giftsData} themePacksData={themePacksData} />
                    </>
                }

                {plan.youtube_video_id ? <div style={{ display: "flex", paddingTop: "1rem", alignSelf: "center", width: "100%", justifyContent: "center" }}>
                    <YouTubeThumbnailEmbed videoId={plan.youtube_video_id} />
                </div> : null}
            </div>
        </MdPlanProvider>
    </ContentPageTemplate>
}
