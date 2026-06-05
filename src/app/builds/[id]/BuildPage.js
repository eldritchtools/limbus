"use client";

import React, { useEffect, useMemo, useState } from "react";

import BuildDisplay from "@/app/components/build/BuildDisplay";
import BuildDisplayMenuCard from "@/app/components/build/BuildDisplayMenuCard";
import DisplayTypeButton from "@/app/components/build/DisplayTypeButton";
import Distribution from "@/app/components/build/Distribution";
import TeamCodeComponent from "@/app/components/build/TeamCodeComponent";
import KeywordIcon from "@/app/components/icons/KeywordIcon";
import StatusIcon from "@/app/components/icons/StatusIcon";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import DragContainer from "@/app/components/objects/DragContainer";
import ImageCarousel from "@/app/components/objects/ImageCarousel";
import ContentPageTemplate, { LoadingContentPageTemplate } from "@/app/components/pageTemplates/ContentPageTemplate";
import { getBuild } from "@/app/database/builds";
import { keywordIdMapping } from "@/app/database/keywordIds";
import { isLocalId } from "@/app/database/localDB";
import { decodeBuildExtraOpts } from "@/app/lib/buildExtraOpts";
import { contentConfig } from "@/app/lib/contentConfig";
import { constructTeamCode } from "@/app/lib/teamCodeEncoding";
import useLocalState from "@/app/lib/useLocalState";
import { YouTubeThumbnailEmbed } from "@/app/lib/youtube";

export default function BuildPage({ id }) {
    const [build, setBuild] = useState(null);
    const [loading, setLoading] = useState(true);

    const [identityLevels, setIdentityLevels] = useState(null);
    const [identityUpties, setIdentityUpties] = useState(null);
    const [egoThreadspins, setEgoThreadspins] = useState(null);
    const [sinnerNotes, setSinnerNotes] = useState(null);
    const [addedIcons, setAddedIcons] = useState(null);
    const [iconSwaps, setIconSwaps] = useState(null);

    const [displayType, setDisplayType] = useLocalState("buildDisplayType", "names");

    useEffect(() => {
        if (loading) {
            const handleBuild = x => {
                setBuild(x);
                if (x.extra_opts) {
                    const extraOpts = decodeBuildExtraOpts(x.extra_opts);
                    if (extraOpts.identityLevels) setIdentityLevels(extraOpts.identityLevels);
                    if (extraOpts.identityUpties) setIdentityUpties(extraOpts.identityUpties);
                    if (extraOpts.egoThreadspins) setEgoThreadspins(extraOpts.egoThreadspins);
                    if (extraOpts.sinnerNotes) setSinnerNotes(extraOpts.sinnerNotes);
                    if (extraOpts.addedIcons) setAddedIcons(extraOpts.addedIcons);
                    if (extraOpts.iconSwaps) setIconSwaps(extraOpts.iconSwaps);
                }
                setLoading(false);
            }

            if (isLocalId(id)) {
                contentConfig.builds.local.get(Number(id)).then(handleBuild);
            } else {
                getBuild(id).then(handleBuild);
            }
        }
    }, [id, loading]);

    const teamCode = useMemo(() => loading ? "" : constructTeamCode(build.identity_ids, build.ego_ids, build.deployment_order), [build, loading]);

    if (loading) return <LoadingContentPageTemplate />

    return <ContentPageTemplate
        targetType={"build"} targetId={id} content={build}
        titleIcons={[
            ...build.keyword_ids.map(id => <KeywordIcon key={id} id={keywordIdMapping[id]} />),
            ...(addedIcons ?? []).map(id => <StatusIcon key={id} id={id} style={{ width: "32px" }} />)
        ]}
        actions={["like", "save", "share", "edit", "delete"]}
    >
        <BuildDisplay
            identityIds={build.identity_ids}
            egoIds={build.ego_ids}
            identityUpties={identityUpties}
            identityLevels={identityLevels}
            egoThreadspins={egoThreadspins}
            sinnerNotes={sinnerNotes}
            iconSwaps={iconSwaps}
            deploymentOrder={build.deployment_order}
            activeSinners={build.active_sinners}
            displayType={displayType}
        />
        <DragContainer style={{ alignSelf: "center", width: "max-content", maxWidth: "100%" }}>
            <div style={{ display: "flex", gap: ".5rem", width: "max-content" }}>
                <BuildDisplayMenuCard>
                    <div>Display Type</div>
                    <DisplayTypeButton value={displayType} setValue={setDisplayType} />
                    <span className="sub-text" style={{ textAlign: "center" }}>Quickly view various details of selected identities and E.G.Os or change how the team is displayed.</span>
                </BuildDisplayMenuCard>
                <Distribution
                    identityIds={build.identity_ids}
                    identityUpties={identityUpties}
                    deploymentOrder={build.deployment_order}
                    activeSinners={build.active_sinners}
                />
                <TeamCodeComponent teamCode={teamCode} />
            </div>
        </DragContainer>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {build?.body?.length > 0 && <>
                <span style={{ fontSize: "1.2rem" }}>Description</span>
                <div>
                    <MarkdownRenderer content={build.body} />
                </div>
            </>
            }
            {build?.image_ids?.length > 0 && <>
                <span style={{ fontSize: "1.2rem" }}>Images</span>
                <ImageCarousel imageIds={build.image_ids} />
            </>
            }
            {build.youtube_video_id ?
                <div style={{ display: "flex", paddingTop: "1rem", alignSelf: "center", width: "100%", justifyContent: "center" }}>
                    <YouTubeThumbnailEmbed videoId={build.youtube_video_id} />
                </div> :
                null
            }
        </div>
    </ContentPageTemplate>
}
