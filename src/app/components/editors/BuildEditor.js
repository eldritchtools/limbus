"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

import BuildEditingComponent from "./BuildEditingComponent";
import { useData } from "../DataProvider";
import KeywordIcon from "../icons/KeywordIcon";
import MarkdownEditorWrapper from "../markdown/MarkdownEditorWrapper";
import { LoadingContentPageTemplate } from "../pageTemplates/ContentPageTemplate";
import TagSelector, { tagToTagSelectorOption } from "../selectors/TagSelector";

import { useAuth } from "@/app/database/authProvider";
import { getBuild, insertBuild, updateBuild } from "@/app/database/builds";
import { keywordIdMapping, keywordToIdMapping } from "@/app/database/keywordIds";
import { isLocalId } from "@/app/database/localDB";
import { decodeBuildExtraOpts, encodeBuildExtraOpts } from "@/app/lib/buildExtraOpts";
import { uiColors } from "@/app/lib/colors";
import { contentConfig } from "@/app/lib/contentConfig";
import { uiStrings } from "@/app/lib/uiStrings";
import { extractYouTubeId } from "@/app/lib/youtube";


export default function BuildEditor({ mode, buildId }) {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [identityIds, setIdentityIds] = useState(Array.from({ length: 12 }, () => null));
    const [egoIds, setEgoIds] = useState(Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => null)));
    const [keywordIds, setKeywordIds] = useState([]);
    const [deploymentOrder, setDeploymentOrder] = useState([]);
    const [activeSinners, setActiveSinners] = useState(7);
    const [youtubeVideo, setYoutubeVideo] = useState('');
    const [tags, setTags] = useState([]);
    const [identityUpties, setIdentityUpties] = useState(Array.from({ length: 12 }, () => ""));
    const [identityLevels, setIdentityLevels] = useState(Array.from({ length: 12 }, () => ""));
    const [egoThreadspins, setEgoThreadspins] = useState(Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => "")));
    const [sinnerNotes, setSinnerNotes] = useState(Array.from({ length: 12 }, () => ""));
    const [additionalToggle, setAdditionalToggle] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [otherSettings, setOtherSettings] = useState(false);
    const [blockDiscovery, setBlockDiscovery] = useState(false);
    const [loading, setLoading] = useState(mode === "edit");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [createdAt, setCreatedAt] = useState(null);
    const { user } = useAuth();
    const router = useRouter();

    const [identitiesMini, identitiesMiniLoading] = useData("identities_mini");

    useEffect(() => {
        if (mode === "edit") {
            const handleBuild = build => {
                if (!build) router.back();
                if (build.username || isLocalId(buildId)) {
                    setTitle(build.title);
                    setBody(build.body);
                    setIdentityIds(build.identity_ids);
                    setEgoIds(build.ego_ids);
                    setKeywordIds(build.keyword_ids.map(kw => keywordIdMapping[kw]));
                    setDeploymentOrder(build.deployment_order);
                    setActiveSinners(build.active_sinners);
                    // setTeamCode(build.team_code);
                    setYoutubeVideo(build.youtube_video_id ?? '');
                    setTags(build.tags.map(t => tagToTagSelectorOption(t)));
                    setIsPublished(build.is_published);
                    setBlockDiscovery(build.block_discovery ?? false);
                    setLoading(false);

                    if (build.extra_opts) {
                        const extraOpts = decodeBuildExtraOpts(build.extra_opts);
                        if (Object.keys(extraOpts).length > 0) setAdditionalToggle(true);
                        if ("identityLevels" in extraOpts) setIdentityLevels(extraOpts.identityLevels);
                        if ("identityUpties" in extraOpts) setIdentityUpties(extraOpts.identityUpties);
                        if ("egoThreadspins" in extraOpts) setEgoThreadspins(extraOpts.egoThreadspins);
                        if ("sinnerNotes" in extraOpts) setSinnerNotes(extraOpts.sinnerNotes);
                    }

                    if (build.created_at) setCreatedAt(build.created_at);
                }
            }

            if (user)
                getBuild(buildId, true).then(handleBuild).catch(_err => {
                    router.push(`/builds/${buildId}`);
                });
            else
                contentConfig.builds.local.get(Number(buildId)).then(handleBuild).catch(_err => {
                    router.push(`/builds/${buildId}`);
                });
        }
    }, [mode, buildId, router, user]);


    const keywordOptions = useMemo(() => identitiesMiniLoading ? {} : identityIds.reduce((acc, id) => {
        if (id && id in identitiesMini) {
            [...identitiesMini[id].types, ...identitiesMini[id].affinities, ...(identitiesMini[id].skillKeywordList ?? [])].forEach(x => {
                if (x in acc)
                    acc[x] += 1;
                else
                    acc[x] = 1;
            })
        }
        return acc;
    }, {}), [identityIds, identitiesMini, identitiesMiniLoading]);

    const handleSave = async (isPublished) => {
        if (title === "") {
            setMessage("Title is required.")
            return;
        }

        if (title.length < 3 || title.length > 100) {
            setMessage("Title must be between 3-100 characters.");
            return;
        }

        const keywordsConverted = keywordIds.map(kw => keywordToIdMapping[kw]);
        const tagsConverted = tags.map(t => t.value);
        const youtubeVideoId = extractYouTubeId(youtubeVideo.trim());

        if (youtubeVideo.trim().length > 0 && youtubeVideoId === null) {
            setMessage("Invalid YouTube video id.");
            return;
        }

        const extraOpts = encodeBuildExtraOpts({identityUpties, identityLevels, egoThreadspins, sinnerNotes});

        setSaving(true);
        if (user) {
            const buildData = {
                userId: user.id,
                title, body, identityIds, egoIds,
                keywordIds: keywordsConverted,
                deploymentOrder, activeSinners,
                teamCode: "",
                youtubeVideoId,
                tags: tagsConverted,
                extraOpts, blockDiscovery,
                published: isPublished,
            }

            if (mode === "edit") {
                buildData.buildId = buildId;
                const data = await updateBuild(buildData);
                router.push(`/builds/${data}`);
            } else {
                const data = await insertBuild(buildData);
                router.push(`/builds/${data}`);
            }
        } else {
            const buildData = {
                title: title,
                body: body,
                identity_ids: identityIds,
                ego_ids: egoIds,
                keyword_ids: keywordsConverted,
                deployment_order: deploymentOrder,
                active_sinners: activeSinners,
                team_code: "",
                youtube_video_id: youtubeVideoId,
                like_count: 0,
                comment_count: 0,
                tags: tagsConverted,
                block_discovery: blockDiscovery,
                is_published: false,
                created_at: createdAt ?? Date.now(),
                updated_at: Date.now(),
                extra_opts: extraOpts
            }

            if (mode === "edit") buildData.id = Number(buildId);

            const data = await contentConfig.builds.local.save(buildData)
            router.push(`/builds/${data}`);
        }
    }

    if (loading) return <LoadingContentPageTemplate />

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", containerType: "inline-size" }}>
        <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
            {mode === "edit" ? "Editing" : "Creating"} Build
        </h2>
        {!user
            ? <div style={{ color: uiColors.red }}>{uiStrings.contentNoUser("builds")}</div>
            : null
        }
        <span style={{fontSize: "0.9rem"}}>{uiStrings.upcomingInContent("builds")}</span>
        <span style={{ fontSize: "1.2rem" }}>Title</span>
        <input type="text" value={title} style={{ width: "clamp(20ch, 80%, 100ch)" }} onChange={e => setTitle(e.target.value)} />
        <span style={{ fontSize: "1.2rem" }}>Team Build</span>
        <BuildEditingComponent
            identityIds={identityIds} setIdentityIds={setIdentityIds}
            egoIds={egoIds} setEgoIds={setEgoIds}
            deploymentOrder={deploymentOrder} setDeploymentOrder={setDeploymentOrder}
            activeSinners={activeSinners} setActiveSinners={setActiveSinners}
            identityLevels={identityLevels} setIdentityLevels={setIdentityLevels}
            identityUpties={identityUpties} setIdentityUpties={setIdentityUpties}
            egoThreadspins={egoThreadspins} setEgoThreadspins={setEgoThreadspins}
            sinnerNotes={sinnerNotes} setSinnerNotes={setSinnerNotes}
            defaultAdditionalToggle={additionalToggle}
        />
        <span style={{ fontSize: "1.2rem" }}>Description</span>
        <div className={{ maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}>
            <MarkdownEditorWrapper value={body} onChange={setBody} placeholder={"Describe your build here..."} />
        </div>
        <span style={{ fontSize: "1.2rem" }}>Keywords</span>
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: "0.2rem", alignItems: "center", minHeight: "50px", flexWrap: "wrap" }}>
                <span style={{ paddingRight: "0.2rem" }}>Selected:</span>
                {keywordIds.map(x =>
                    <button key={x} onClick={() => setKeywordIds(p => p.filter(k => k !== x))} style={{ display: "flex", alignItems: "center", fontSize: "1rem" }}>
                        <KeywordIcon id={x} />
                    </button>
                )}
            </div>
            <div style={{ display: "flex", gap: "0.2rem", alignItems: "center", minHeight: "50px", flexWrap: "wrap" }}>
                <span style={{ paddingRight: "0.2rem" }}>Recommended:</span>
                {
                    Object.entries(keywordOptions)
                        .filter(([x, _]) => !keywordIds.includes(x))
                        .sort((a, b) => b[1] === a[1] ? keywordToIdMapping[a[0]] - keywordToIdMapping[b[0]] : b[1] - a[1])
                        .map(([x, n]) =>
                            <button key={x} onClick={() => setKeywordIds(p => [...p, x])} style={{ display: "flex", alignItems: "center", fontSize: "1rem" }}>
                                <KeywordIcon id={x} />
                            </button>
                        )
                }
            </div>
        </div>
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
