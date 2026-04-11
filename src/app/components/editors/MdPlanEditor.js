"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Select from "react-select";

import { useData } from "../DataProvider";
import Icon from "../icons/Icon";
import KeywordIcon from "../icons/KeywordIcon";
import MarkdownEditorWrapper from "../markdown/MarkdownEditorWrapper";
import FloorPlan from "../mdPlans/FloorPlan";
import GracesDisplay from "../mdPlans/GracesDisplay";
import RecommendedBuildsDisplay from "../mdPlans/RecommendedBuildsDisplay";
import RecommendedListDisplay from "../mdPlans/RecommendedListDisplay";
import RecommendedSpecBuildDisplay from "../mdPlans/RecommendedSpecBuildDisplay";
import { useModal } from "../modals/ModalProvider";
import Gift from "../objects/Gift";
import { LoadingContentPageTemplate } from "../pageTemplates/ContentPageTemplate";
import TagSelector, { tagToTagSelectorOption } from "../selectors/TagSelector";

import { useAuth } from "@/app/database/authProvider";
import { keywordIdMapping, keywordToIdMapping } from "@/app/database/keywordIds";
import { isLocalId } from "@/app/database/localDB";
import { createMdPlan, getMdPlan, updateMdPlan } from "@/app/database/mdPlans";
import { decodeBuildExtraOpts, encodeBuildExtraOpts } from "@/app/lib/buildExtraOpts";
import { uiColors } from "@/app/lib/colors";
import { contentConfig } from "@/app/lib/contentConfig";
import { mdDiffculties, observeCost } from "@/app/lib/mirrorDungeon";
import { uiStrings } from "@/app/lib/uiStrings";
import { extractYouTubeId } from "@/app/lib/youtube";
import { selectStyle } from "@/app/styles/selectStyle";

export default function MdPlanEditor({ mode, mdPlanId }) {
    const [mdData, mdDataLoading] = useData("md/details");
    const [themePacks, themePacksLoading] = useData("md_theme_packs");
    const [floorPacks, floorPacksLoading] = useData("md_floor_packs");
    const { openSelectGiftModal, openSelectThemePackModal } = useModal();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [recommendationMode, setRecommendationMode] = useState("none");
    const [builds, setBuilds] = useState([]);
    const [identityIds, setIdentityIds] = useState([]);
    const [egoIds, setEgoIds] = useState([]);
    const [extraOpts, setExtraOpts] = useState("");
    const [difficulty, setDifficulty] = useState("N");
    const [graceLevels, setGraceLevels] = useState(Array.from({ length: 10 }, () => 0));
    const [keyword, setKeyword] = useState(null);
    const [startGifts, setStartGifts] = useState([]);
    const [observeGifts, setObserveGifts] = useState([]);
    const [plannedGifts, setPlannedGifts] = useState([]);
    const [floors, setFloors] = useState([]);
    const startGiftsRef = useRef(startGifts);
    const observeGiftsRef = useRef(observeGifts);
    const plannedGiftsRef = useRef(plannedGifts);
    const floorsRef = useRef(floors);

    useEffect(() => { startGiftsRef.current = startGifts }, [startGifts]);
    useEffect(() => { observeGiftsRef.current = observeGifts }, [observeGifts]);
    useEffect(() => { plannedGiftsRef.current = plannedGifts }, [plannedGifts]);
    useEffect(() => { floorsRef.current = floors }, [floors]);

    const [youtubeVideo, setYoutubeVideo] = useState('');
    const [tags, setTags] = useState([]);
    const [isPublished, setIsPublished] = useState(false);
    const [otherSettings, setOtherSettings] = useState(false);
    const [blockDiscovery, setBlockDiscovery] = useState(false);
    const [loading, setLoading] = useState(mode === "edit");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [createdAt, setCreatedAt] = useState(null);
    const { user } = useAuth();
    const router = useRouter();
    const { isMobile } = useBreakpoint();

    useEffect(() => {
        if (mode === "edit") {
            const handleMdPlan = mdPlan => {
                if (!mdPlan) router.back();
                if (mdPlan.username || isLocalId(mdPlanId)) {
                    setTitle(mdPlan.title);
                    setBody(mdPlan.body);
                    setBuilds(mdPlan.builds);
                    setRecommendationMode(mdPlan.recommendation_mode);
                    setIdentityIds(mdPlan.identity_ids);
                    setEgoIds(mdPlan.ego_ids);
                    setExtraOpts(mdPlan.extra_opts ? decodeBuildExtraOpts(mdPlan.extra_opts) : "");
                    setBuilds(mdPlan.builds);
                    setDifficulty(mdPlan.difficulty);
                    setGraceLevels(mdPlan.grace_levels);
                    setKeyword(keywordIdMapping[mdPlan.keyword_id]);
                    setStartGifts(mdPlan.start_gift_ids);
                    setObserveGifts(mdPlan.observe_gift_ids);
                    setPlannedGifts(mdPlan.target_gift_ids);
                    setFloors(mdPlan.floors.map((x, i) => ({ ...x, key: i })));
                    setYoutubeVideo(mdPlan.youtube_video_id ?? '');
                    setTags(mdPlan.tags.map(t => tagToTagSelectorOption(t?.name ?? t)));
                    setIsPublished(mdPlan.is_published);
                    setBlockDiscovery(mdPlan.block_discovery ?? false);
                    setLoading(false);

                    if (mdPlan.created_at) setCreatedAt(mdPlan.created_at);
                }
            }

            if (user)
                getMdPlan(mdPlanId).then(handleMdPlan).catch(_err => {
                    router.push(`/md-plans/${mdPlanId}`);
                });
            else
                contentConfig.md_plans.local.get(Number(mdPlanId)).then(handleMdPlan).catch(_err => {
                    router.push(`/md-plans/${mdPlanId}`);
                });
        }
    }, [mode, mdPlanId, router, user]);

    const keywordOptions = useMemo(() => mdDataLoading ? [] :
        Object.keys(mdData.startGiftPool).map(x => ({
            label: <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <KeywordIcon id={x} />
                {x}
            </div>,
            value: x
        })),
        [mdData, mdDataLoading]);

    const keywordOptionsMapped = useMemo(() => keywordOptions.reduce((acc, x) => { acc[x.value] = x; return acc; }, {}), [keywordOptions]);

    const handleSave = async (isPublished) => {
        if (title === "") {
            setMessage("Title is required.")
            return;
        }

        if (title.length < 3 || title.length > 100) {
            setMessage("Title must be between 3-100 characters.");
            return;
        }

        const tagsConverted = tags.map(t => t.value);
        const youtubeVideoId = extractYouTubeId(youtubeVideo.trim());

        if (youtubeVideo.trim().length > 0 && youtubeVideoId === null) {
            setMessage("Invalid YouTube video id.");
            return;
        }

        const cost = mdData.grace.reduce((acc, grace) => acc + grace.cost * graceLevels[grace.index - 1], 0) + observeCost[observeGifts.length];

        let planIdentityIds = [];
        let planEgoIds = [];
        let planBuilds = [];
        let planExtraOpts = null;

        if (recommendationMode === "list") {
            planIdentityIds = identityIds;
            planEgoIds = egoIds;
        } else if (recommendationMode === "build") {
            const idMap = {};
            const egoMap = {};
            builds.forEach(build => {
                build.identity_ids.forEach(id => {
                    if (!id) return;
                    if (id in idMap) idMap[id]++;
                    else idMap[id] = 1;
                });
                build.ego_ids.flat().forEach(id => {
                    if (!id) return;
                    if (id in egoMap) egoMap[id]++;
                    else egoMap[id] = 1;
                });
            });

            planIdentityIds = Object.entries(idMap).sort(([, anum], [, bnum]) => bnum - anum).map(([id]) => id).slice(0, 12);
            planEgoIds = Object.entries(egoMap).sort(([, anum], [, bnum]) => bnum - anum).map(([id]) => id).slice(0, Math.max(12 - planIdentityIds.length, 0));
            planBuilds = builds;
        } else if (recommendationMode === "specbuild") {
            planIdentityIds = identityIds.filter(x => x !== "");
            planEgoIds = egoIds.flat().filter(x => x !== "");
            planExtraOpts = encodeBuildExtraOpts(extraOpts);
        }

        setSaving(true);
        if (user) {
            const planData = {
                title, body, recommendationMode, difficulty,
                identityIds: planIdentityIds,
                egoIds: planEgoIds,
                extraOpts: planExtraOpts,
                graceLevels, cost,
                keywordId: keywordToIdMapping[keyword] ?? null,
                startGiftIds: startGifts,
                observeGiftIds: observeGifts,
                targetGiftIds: plannedGifts,
                floors, youtubeVideoId,
                published: isPublished,
                blockDiscovery,
                buildIds: planBuilds.map(build => build.id),
                tags: tagsConverted
            }

            if (mode === "edit") {
                planData.planId = mdPlanId;
                const data = await updateMdPlan(planData);
                router.push(`/md-plans/${data}`);
            } else {
                const data = await createMdPlan(planData);
                router.push(`/md-plans/${data}`);
            }
        } else {
            const planData = {
                title: title,
                body: body,
                recommendation_mode: recommendationMode,
                difficulty: difficulty,
                identity_ids: planIdentityIds,
                ego_ids: planEgoIds,
                extra_opts: planExtraOpts,
                grace_levels: graceLevels,
                cost: cost,
                keyword_id: keywordToIdMapping[keyword] ?? null,
                start_gift_ids: startGifts,
                observe_gift_ids: observeGifts,
                target_gift_ids: plannedGifts,
                floors: floors,
                youtube_video_id: youtubeVideoId,
                is_published: isPublished,
                block_discovery: blockDiscovery,
                tags: tagsConverted,
                builds: planBuilds,
                created_at: createdAt ?? Date.now(),
                updated_at: Date.now(),
                like_count: 0,
                comment_count: 0
            }

            if (mode === "edit") planData.id = Number(mdPlanId);

            const data = await contentConfig.md_plans.local.save(planData);
            router.push(`/md-plans/${data}`);
        }
    }

    const addStartingGift = useCallback(() =>
        openSelectGiftModal({
            getChoiceList: () => mdData?.startGiftPool[keyword].map(x => `${x}`),
            showSearch: false,
            onSelectGift: id => {
                const lim = 1 + (graceLevels[3] !== 0) + (graceLevels[9] !== 0);
                if (startGiftsRef.current.length < lim) setStartGifts(p => [...p, id])
            },
            forcedFilter: gift => !startGiftsRef.current.includes(gift.id)
        }),
        [mdData, graceLevels, keyword, openSelectGiftModal]
    );

    const removeStartingGift = useCallback(() =>
        openSelectGiftModal({
            getChoiceList: () => startGiftsRef.current,
            showSearch: false,
            onSelectGift: id => setStartGifts(p => p.filter(x => x !== id))
        }),
        [openSelectGiftModal]
    );

    const addGiftObservation = useCallback(() =>
        openSelectGiftModal({
            showSearch: true,
            onSelectGift: id => { if (observeGiftsRef.current.length < 3) setObserveGifts(p => [...p, id]) },
            forcedFilter: gift => ["1", "2", "3"].includes(gift.tier) && !gift.vestige && !observeGiftsRef.current.includes(gift.id) && !gift.fusion
        }),
        [openSelectGiftModal]
    );

    const removeGiftObservation = useCallback(() =>
        openSelectGiftModal({
            getChoiceList: () => observeGiftsRef.current,
            showSearch: false,
            onSelectGift: id => setObserveGifts(p => p.filter(x => x !== id))
        }),
        [openSelectGiftModal]
    );

    const addTargetedGifts = useCallback(() =>
        openSelectGiftModal({
            showSearch: true,
            onSelectGift: id => setPlannedGifts(p => [...p, id]),
            forcedFilter: gift => !gift.vestige && !plannedGiftsRef.current.includes(gift.id)
        }),
        [openSelectGiftModal]
    );

    const removeTargetedGifts = useCallback(() =>
        openSelectGiftModal({
            getChoiceList: () => plannedGiftsRef.current,
            showSearch: false,
            onSelectGift: id => setPlannedGifts(p => p.filter(x => x !== id)),
        }),
        [openSelectGiftModal]
    );

    const addFloorGifts = useCallback(index =>
        openSelectGiftModal({
            getChoiceList: () => Array.from(floorsRef.current[index].themePacks.reduce((acc, id) => {
                if ("exclusive_gifts" in themePacks[id])
                    themePacks[id].exclusive_gifts.forEach(giftId => acc.add(giftId))
                return acc;
            }, new Set())),
            showSearch: true,
            onSelectGift: id => setFloors(p => p.map((floor, i) => i === index ?
                { ...floor, gifts: [...floor.gifts, id] } :
                floor)
            ),
            forcedFilter: gift => !gift.vestige && !floorsRef.current[index].gifts?.includes(gift.id)
        }),
        [themePacks, openSelectGiftModal]
    );

    const removeFloorGifts = useCallback(index =>
        openSelectGiftModal({
            getChoiceList: () => floorsRef.current[index].gifts,
            showSearch: false,
            onSelectGift: id => setFloors(p => p.map((floor, i) => i === index ?
                { ...floor, gifts: floor.gifts.filter(x => x !== id) } :
                floor)
            )
        }),
        [openSelectGiftModal]
    );

    const addThemePacks = useCallback(index => {
        if (floorPacksLoading) return;

        const floor = floorsRef.current[index];
        const options = difficulty === "M" ?
            Array.from(new Set([...floorPacks.normal[floor.floorSet], ...floorPacks.hard[floor.floorSet]])) :
            (difficulty === "N" ?
                floorPacks.normal[floor.floorSet] :
                floorPacks.hard[floor.floorSet]
            );

        openSelectThemePackModal({
            getOptions: () => options.filter(x => !floorsRef.current[index].themePacks.includes(x)),
            onSelectPack: id => setFloors(p => p.map((floor, i) => i === index ?
                { ...floor, themePacks: [...floor.themePacks, id] } :
                floor)
            )
        });
    },
        [difficulty, floorPacks, floorPacksLoading, openSelectThemePackModal]
    );
    const removeThemePacks = useCallback(index =>
        openSelectThemePackModal({
            getOptions: () => floorsRef.current[index].themePacks,
            onSelectPack: id => setFloors(p => p.map((floor, i) => i === index ?
                { ...floor, themePacks: floor.themePacks.filter(x => x !== id) } :
                floor)
            )
        }),
        [openSelectThemePackModal]
    );

    const handleSetRecommendationMode = mode => {
        setRecommendationMode(mode);
        setBuilds([]);
        setIdentityIds([]);
        setEgoIds([]);
        setExtraOpts("");
    }

    if (loading || themePacksLoading || mdDataLoading || floorPacksLoading) return <LoadingContentPageTemplate />

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", containerType: "inline-size" }}>
        <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
            {mode === "edit" ? "Editing" : "Creating"} Run Plan
        </h2>
        {!user ?
            <div style={{ color: uiColors.red }}>{uiStrings.contentNoUser("md plans")}</div>
            : null
        }
        <span style={{ fontSize: "1.2rem" }}>Title</span>
        <input type="text" value={title} style={{ width: "clamp(20ch, 80%, 100ch)" }} onChange={e => setTitle(e.target.value)} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <span style={{ fontSize: "1.2rem" }}>Select Difficulty:</span>
            <select name="difficulty" id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                {Object.entries(mdDiffculties).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <span style={{ fontSize: "1.2rem" }}>Select Team Recommendation Mode:</span>
            <select name="recommend" id="recommend" value={recommendationMode} onChange={e => handleSetRecommendationMode(e.target.value)}>
                <option value="none">None</option>
                <option value="list">List</option>
                <option value="build">Build</option>
                <option value="specbuild">Spec Build</option>
            </select>
        </div>
        <span style={{ color: "#aaa" }}>Select a mode if you want to recommend what to bring for this run plan. List mode lets you display a list of identities and E.G.Os. Build mode lets you select builds available on the site. Use Spec Build if you want to make an entirely new build specifically for this MD Plan.</span>
        <span style={{ color: uiColors.red }}>Warning: Changing recommendation mode WILL reset anything currently in recommended.</span>

        {recommendationMode === "list" ? <>
            <span style={{ fontSize: "1.2rem" }}>Recommended Identities and E.G.Os</span>
            <span style={{ color: "#aaa" }}>Select identities and E.G.Os to recommend.</span>
            <RecommendedListDisplay identityIds={identityIds} setIdentityIds={setIdentityIds} egoIds={egoIds} setEgoIds={setEgoIds} editable={true} />
        </> :
            null
        }

        {recommendationMode === "build" ? <>
            <span style={{ fontSize: "1.2rem" }}>Recommended Team Builds</span>
            <span style={{ color: "#aaa" }}>Select team builds to recommend. You may select as many as you want.</span>
            <RecommendedBuildsDisplay builds={builds} setBuilds={setBuilds} editable={true} />
        </> :
            null
        }

        {recommendationMode === "specbuild" ? <>
            <span style={{ fontSize: "1.2rem" }}>Recommended Team Build</span>
            <span style={{ color: "#aaa" }}>Create the recommended team build.</span>
            <RecommendedSpecBuildDisplay 
                identityIds={identityIds} setIdentityIds={setIdentityIds} 
                egoIds={egoIds} setEgoIds={setEgoIds} 
                extraOpts={extraOpts} setExtraOpts={setExtraOpts} 
                editable={true} 
            />
        </> :
            null
        }

        <span style={{ fontSize: "1.2rem" }}>Description</span>
        <div className={{ maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}>
            <MarkdownEditorWrapper value={body} onChange={setBody} placeholder={"Describe your run plan here..."} />
        </div>
        <span style={{ fontSize: "1.2rem" }}>Grace of the Stars</span>
        <span style={{ color: "#aaa" }}>Starting buffs bought with starlight</span>
        <GracesDisplay graceLevels={graceLevels} setGraceLevels={setGraceLevels} editable={true} />
        <span style={{ fontSize: "1.2rem" }}>Gifts Setup</span>
        <span style={{ color: "#aaa" }}>Gifts to start the run with. The corresponding graces need to be turned on to select multiple starting gifts.</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                width: isMobile ? "200px" : "300px", padding: "0.2rem", border: "1px #aaa solid", borderRadius: "1rem"
            }}>
                <span style={{ fontSize: "1.2rem" }}>Starting Gifts</span>
                <Select
                    value={keywordOptionsMapped[keyword]}
                    onChange={x => { setStartGifts([]); setKeyword(x.value); }}
                    options={keywordOptions}
                    styles={selectStyle}
                    placeholder={"Select keyword..."}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <button disabled={!keyword} onClick={() => addStartingGift()}>Add</button>
                    <button disabled={!keyword} onClick={() => removeStartingGift()}>Remove</button>
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: "0.2rem" }}>
                    {startGifts.map(giftId => <Gift key={giftId} id={giftId} scale={isMobile ? 0.6 : 1} />)}
                </div>
            </div>
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                width: isMobile ? "200px" : "300px", padding: "0.2rem", border: "1px #aaa solid", borderRadius: "1rem"
            }}>
                <span style={{ fontSize: "1.2rem" }}>Gift Observation</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontWeight: "bold" }}>
                    <Icon path={"starlight"} style={{ width: "25px", height: "25px" }} />
                    {observeCost[observeGifts.length]}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <button onClick={() => addGiftObservation()}>Add</button>
                    <button onClick={() => removeGiftObservation()}>Remove</button>
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: "0.2rem" }}>
                    {observeGifts.map(giftId => <Gift key={giftId} id={giftId} scale={isMobile ? 0.6 : 1} />)}
                </div>
            </div>
        </div>

        <span style={{ fontSize: "1.2rem" }}>Targeted Gifts</span>
        <span style={{ color: "#aaa" }}>Gifts that should be targeted during the run</span>

        <div style={{ display: "flex" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 80px)" }}>
                <button onClick={() => addTargetedGifts()}>Add</button>
                <button onClick={() => removeTargetedGifts()}>Remove</button>
            </div>
        </div>
        {plannedGifts.length > 0 ?
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", padding: "0.2rem" }}>
                {plannedGifts.map(giftId => <Gift key={giftId} id={giftId} scale={isMobile ? 0.6 : 1} />)}
            </div> :
            null
        }

        <span style={{ fontSize: "1.2rem" }}>Floor Plan</span>
        <span style={{ color: "#aaa" }}>Plans for each floor or set of floors. The floor set determines the available theme packs, while the label is shown to the viewers of the run plan (defaults to the floor set if not provided).</span>
        <FloorPlan
            difficulty={difficulty} floors={floors} setFloors={setFloors}
            addThemePacks={addThemePacks} removeThemePacks={removeThemePacks}
            addFloorGifts={addFloorGifts} removeFloorGifts={removeFloorGifts}
            editable={true}
        />

        <div>
            <span style={{ fontSize: "1.2rem" }} >Video</span>
        </div>
        <div>
            <input type="text" value={youtubeVideo} onChange={(e) => setYoutubeVideo(e.target.value)} placeholder="Paste a YouTube Video link or id (optional)" style={{ width: "clamp(20ch, 80%, 50ch)" }} />
        </div>
        {youtubeVideo.length > 0 ?
            <span style={{ fontSize: "0.8rem" }}>Youtube Video Id: {extractYouTubeId(youtubeVideo.trim()) ?? "Not found"}</span> :
            null}
        <span style={{ fontSize: "1.2rem" }}>Tags</span>
        <TagSelector selected={tags} onChange={setTags} creatable={true} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div>
                <button className={otherSettings ? "toggle-button-active" : "toggle-button"} onClick={() => setOtherSettings(p => !p)}>
                    Other Settings
                </button>
            </div>
            {otherSettings ?
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <div style={{ fontSize: "0.8rem", color: "#aaa" }}>
                        Hide from discovery related features (popular, new, random, etc). Can still be found via search or on profiles.
                    </div>
                    <label style={{ display: "flex", alignItems: "center" }}>
                        <input type="checkbox" checked={blockDiscovery} onChange={e => setBlockDiscovery(e.target.checked)} />
                        <div>Block Discovery</div>
                    </label>
                </div> :
                null
            }
        </div>
        {user && !isPublished ?
            <div style={{ color: "#aaa" }}>{uiStrings.drafts}</div> :
            null
        }
        {isPublished ?
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button style={{ padding: "0.5rem", fontSize: "1.2rem" }} onClick={() => handleSave(true)} disabled={saving}>Update</button>
                <button style={{ padding: "0.5rem", fontSize: "1.2rem" }} onClick={() => router.back()} disabled={saving}>Cancel</button>
                <span>{message}</span>
            </div> :
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button style={{ padding: "0.5rem", fontSize: "1.2rem" }} onClick={() => handleSave(false)} disabled={saving}>Save as Draft</button>
                {user ?
                    <button style={{ padding: "0.5rem", fontSize: "1.2rem" }} onClick={() => handleSave(true)} disabled={saving}>Publish</button> :
                    null
                }
                <span>{message}</span>
            </div>
        }
    </div>
}
