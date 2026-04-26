"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useData } from "@/app/components/DataProvider";
import Gift from "@/app/components/gifts/Gift";
import Icon from "@/app/components/icons/Icon";
import IdentityIcon from "@/app/components/icons/IdentityIcon";
import KeywordIcon from "@/app/components/icons/KeywordIcon";
import ThemePackIcon from "@/app/components/icons/ThemePackIcon";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import AdversitiesDisplay, { AdversitiesPointTotal } from "@/app/components/mdPlans/AdversitiesDisplay";
import FloorPlan from "@/app/components/mdPlans/FloorPlan";
import GracesDisplay from "@/app/components/mdPlans/GracesDisplay";
import RecommendedBuildsDisplay from "@/app/components/mdPlans/RecommendedBuildsDisplay";
import RecommendedListDisplay from "@/app/components/mdPlans/RecommendedListDisplay";
import RecommendedSpecBuildDisplay from "@/app/components/mdPlans/RecommendedSpecBuildDisplay";
import ContentPageTemplate, { LoadingContentPageTemplate } from "@/app/components/pageTemplates/ContentPageTemplate";
import SkillReplace from "@/app/components/skill/SkillReplace";
import { keywordIdMapping } from "@/app/database/keywordIds";
import { getLocalStore, isLocalId } from "@/app/database/localDB";
import { getMdPlan } from "@/app/database/mdPlans";
import { decodeBuildExtraOpts } from "@/app/lib/buildExtraOpts";
import { keywords } from "@/app/lib/constants";
import { contentConfig } from "@/app/lib/contentConfig";
import { mdDiffculties, observeCost } from "@/app/lib/mirrorDungeon";
import useLocalState from "@/app/lib/useLocalState";
import { YouTubeThumbnailEmbed } from "@/app/lib/youtube";

export default function MdPlanPage({ params }) {
    const { id } = React.use(params);
    const [giftsData, giftsLoading] = useData("gifts");
    const [plan, setPlan] = useState(null);
    const [identityIds, setIdentityIds] = useState([]);
    const [egoIds, setEgoIds] = useState([]);
    const [extraOpts, setExtraOpts] = useState(null);
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trackingLoading, setTrackingLoading] = useState(true);
    const [sortMarked, setSortMarked] = useLocalState("mdPlanTrackingSortMarked", false);
    const [giftsSort, setGiftsSort] = useLocalState("mdPlansGiftSort", "default");
    const saveTimeout = useRef(null);

    const { isMobile } = useBreakpoint();

    useEffect(() => {
        if (loading) {
            const handlePlan = x => {
                setPlan(x);
                setExtraOpts(decodeBuildExtraOpts(x.extra_opts) ?? "");
                if (x.recommendation_mode === "specbuild") {
                    setIdentityIds(x.identity_ids);
                    setEgoIds(x.ego_ids);
                }
                setLoading(false);
            }

            if (isLocalId(id)) {
                contentConfig.md_plans.local.get(Number(id)).then(handlePlan);
            } else {
                getMdPlan(id).then(handlePlan);
            }

            getLocalStore("mdPlanTracking").get(id).then(x => {
                setTrackingLoading(false);
                if (!x) return;
                setTracking({ gifts: new Set(x.gifts), themePacks: new Set(x.themePacks) });
            });
        }
    }, [id, loading]);

    useEffect(() => {
        if (trackingLoading || !tracking) return;

        const saveData = async () => {
            const data = { id: id, gifts: [...tracking.gifts], themePacks: [...tracking.themePacks] };
            if (data.gifts.length === 0 && data.themePacks.length === 0)
                getLocalStore("mdPlanTracking").remove(id);
            else
                getLocalStore("mdPlanTracking").save(data);
        };

        clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(async () => {
            try {
                await saveData();
            } catch (err) {
                console.error("Unable to persist data.");
            }
        }, 1000);

        return () => clearTimeout(saveTimeout.current);
    }, [tracking, trackingLoading, id]);

    const toggleTracking = () => {
        if (tracking) {
            setTracking(null);
            return;
        }

        getLocalStore("mdPlanTracking").get(id).then(x => {
            console.log(x);
            if (x) setTracking({ gifts: new Set(x.gifts), themePacks: new Set(x.themePacks) });
            else setTracking({ gifts: new Set(), themePacks: new Set() });
        });
    }

    const resetTracking = () => {
        setTracking({ gifts: new Set(), themePacks: new Set() });
        getLocalStore("mdPlanTracking").remove(id);
    }

    const createGiftListComponent = useCallback((giftIds, scale, center = true) => {
        if (!tracking || (giftsSort !== "default" && giftsLoading))
            return <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.1rem", justifyContent: center ? "center" : "start" }}>
                {giftIds.map(giftId => <Gift key={giftId} id={giftId} scale={scale} />)}
            </div>

        const toggleGift = (giftId, marked) => {
            const newSet = new Set(tracking.gifts);
            if (marked) newSet.delete(Number(giftId));
            else newSet.add(Number(giftId));
            setTracking({ ...tracking, gifts: newSet });
        };

        let giftsList = [...giftIds];
        if (giftsSort === "tier") {
            giftsList = giftsList.sort((a, b) => {
                const ta = giftsData[a].tier;
                const tb = giftsData[b].tier;
                if (ta === tb) return Number(a) - Number(b);
                return tb.localeCompare(ta);
            })
        } else if (giftsSort === "keyword") {
            giftsList = giftsList.sort((a, b) => {
                const ka = keywords.findIndex(x => x === giftsData[a].keyword);
                const kb = keywords.findIndex(x => x === giftsData[b].keyword);
                if (ka === kb) return Number(a) - Number(b);
                return ka - kb;
            })
        }

        if (sortMarked) {
            const [marked, unmarked] = giftsList.reduce(([marked, unmarked], id) => {
                if (tracking.gifts.has(Number(id))) marked.push(id);
                else unmarked.push(id);
                return [marked, unmarked];
            }, [[], []]);
            giftsList = [...unmarked, ...marked];
        }

        return <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.1rem", justifyContent: center ? "center" : "start" }}>
            {giftsList.map(giftId => {
                const marked = tracking.gifts.has(Number(giftId));
                return <div key={giftId} onClick={() => toggleGift(giftId, marked)} style={{ filter: `brightness(${marked ? 0.5 : 1})` }}>
                    <Gift id={giftId} scale={scale} expandable={false} />
                </div>
            })}
        </div>
    }, [tracking, giftsSort, giftsData, giftsLoading, sortMarked]);

    const createThemePackListComponent = useCallback((themePackIds, scale) => {
        if (!tracking) return <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.1rem", justifyContent: "center" }}>
            {themePackIds.map(themePackId => <ThemePackIcon key={themePackId} id={themePackId} displayName={true} scale={scale} />)}
        </div>

        const toggleThemePack = (themePackId, marked) => {
            const newSet = new Set(tracking.themePacks);
            if (marked) newSet.delete(themePackId);
            else newSet.add(themePackId);
            setTracking({ ...tracking, themePacks: newSet });
        };

        let themePacksList;
        if (sortMarked) {
            const [marked, unmarked] = themePackIds.reduce(([marked, unmarked], id) => {
                if (tracking.themePacks.has(id)) marked.push(id);
                else unmarked.push(id);
                return [marked, unmarked];
            }, [[], []]);
            themePacksList = [...unmarked, ...marked];
        } else {
            themePacksList = themePackIds;
        }

        return <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.1rem", justifyContent: "center" }}>
            {themePacksList.map(themePackId => {
                const marked = tracking.themePacks.has(themePackId);
                return <div key={themePackId} onClick={() => toggleThemePack(themePackId, marked)} style={{ filter: `brightness(${marked ? 0.5 : 1})` }}>
                    <ThemePackIcon id={themePackId} displayName={true} scale={scale} />
                </div>
            })}
        </div>
    }, [tracking, sortMarked]);

    const handleGiftsSortButtonClick = () => {
        if (giftsSort === "default") setGiftsSort("tier");
        else if (giftsSort === "tier") setGiftsSort("keyword");
        else setGiftsSort("default");
    }

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
                <RecommendedListDisplay identityIds={plan.identity_ids} egoIds={plan.ego_ids} skillReplaces={extraOpts?.skillReplaces} editable={false} />
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

            <span style={{ fontSize: "1.2rem" }}>Tracking Mode</span>
            <span style={{ color: "#aaa" }}>Tracking mode allows you to mark gifts you&apos;ve obtained or theme packs you&apos;ve entered by clicking them. Any progress made is saved locally. Tracking mode is automatically activated if you have tracking data for this MD Plan, reset your tracking data if you want to disable this.</span>
            <div style={{ display: "flex", gap: "0.25rem" }}>
                <button onClick={() => toggleTracking()}>
                    {tracking === null ? "Activate Tracking Mode" : "Deactivate Tracking Mode"}
                </button>
                {
                    tracking ? <>
                        <button onClick={() => resetTracking()}>Reset Tracking</button>
                        <button className={`toggle-button ${sortMarked ? 'active' : ''}`} onClick={() => setSortMarked(p => !p)}>Sort Marked Items to End</button>
                        <button onClick={handleGiftsSortButtonClick}>
                            Sort Gifts: {giftsSort === "default" ? "Default" : (giftsSort === "tier" ? "By Tier" : "By Keyword")}
                        </button>
                    </> :
                        null
                }
            </div>

            {plan.recommendation_mode === "build" && extraOpts?.skillReplaces ? <>
                <span style={{ fontSize: "1.2rem" }}>Skill Replacements</span>
                <span style={{ color: "#aaa" }}>Skills to replace on recommended identities.</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxWidth: "100%" }}>
                    {Object.entries(extraOpts.skillReplaces).map(([id, counts]) =>
                        <div key={id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                            <IdentityIcon id={id} size={128} displayName={true} displayRarity={true} />
                            <SkillReplace counts={counts} />
                        </div>)}
                </div>
            </> :
                null
            }

            {plan.grace_levels.some(x => x > 0) ?
                <>
                    <span style={{ fontSize: "1.2rem" }}>Grace of the Stars</span>
                    <span style={{ color: "#aaa" }}>Starting buffs bought with starlight</span>
                    <GracesDisplay graceLevels={plan.grace_levels} />
                </> :
                null
            }

            {
                plan.difficulty === "E" && plan.adversities && Object.keys(plan.adversities).length > 0 ?
                    <>
                        <span style={{ fontSize: "1.2rem" }}>Adversities: <AdversitiesPointTotal adversities={plan.adversities} /></span>
                        <span style={{ color: "#aaa" }}>Adversities to take in the Extreme floors</span>
                        <AdversitiesDisplay adversities={plan.adversities} />
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
                                {createGiftListComponent(plan.start_gift_ids, isMobile ? 0.6 : 1)}
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
                                {createGiftListComponent(plan.observe_gift_ids, isMobile ? 0.6 : 1)}
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
                    {createGiftListComponent(plan.target_gift_ids, isMobile ? 0.6 : 1, false)}
                </> :
                null
            }

            {plan.floors.length > 0 ?
                <>
                    <span style={{ fontSize: "1.2rem" }}>Floor Plan</span>
                    <FloorPlan floors={plan.floors} createGiftListComponent={createGiftListComponent} createThemePackListComponent={createThemePackListComponent} />
                </> :
                null
            }

            {plan.youtube_video_id ? <div style={{ display: "flex", paddingTop: "1rem", alignSelf: "center", width: "100%", justifyContent: "center" }}>
                <YouTubeThumbnailEmbed videoId={plan.youtube_video_id} />
            </div> : null}
        </div>
    </ContentPageTemplate>
}
