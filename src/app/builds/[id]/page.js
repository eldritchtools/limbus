"use client";

import React, { useEffect, useMemo, useState } from "react";

import BuildDisplay from "@/app/components/build/BuildDisplay";
import DisplayTypeButton from "@/app/components/build/DisplayTypeButton";
import SinDistribution from "@/app/components/build/SinDistribution";
import TeamCodeComponent from "@/app/components/build/TeamCodeComponent";
import KeywordIcon from "@/app/components/icons/KeywordIcon";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import ContentPageTemplate, { LoadingContentPageTemplate } from "@/app/components/pageTemplates/ContentPageTemplate";
import { getBuild } from "@/app/database/builds";
import { isLocalId, localStores } from "@/app/database/localDB";
import { constructTeamCode } from "@/app/lib/teamCodeEncoding";
import useLocalState from "@/app/lib/useLocalState";
import { YouTubeThumbnailEmbed } from "@/app/lib/youtube";

export default function BuildPage({ params }) {
    const { id } = React.use(params);
    const [build, setBuild] = useState(null);
    const [loading, setLoading] = useState(true);

    const [identityLevels, setIdentityLevels] = useState(null);
    const [identityUpties, setIdentityUpties] = useState(null);
    const [egoThreadspins, setEgoThreadspins] = useState(null);

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
                }
                setLoading(false);
            }

            if (isLocalId(id)) {
                localStores["builds"].get(Number(id)).then(handleBuild);
            } else {
                getBuild(id).then(handleBuild);
            }
        }
    }, [id, loading]);

    const teamCode = useMemo(() => loading ? "" : constructTeamCode(build.identity_ids, build.ego_ids, build.deployment_order), [build, loading]);

    if(loading) return <LoadingContentPageTemplate />

    return <ContentPageTemplate
        targetType={"build"} targetId={id} content={build}
        titleIcons={build.keyword_ids.map(id => <KeywordIcon key={id} id={id} />)}
        sideComponent={<div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "center", gap: "0.2rem" }}>
            <div>Display Type</div>
            <DisplayTypeButton value={displayType} setValue={setDisplayType} />
        </div>}
        actions={["like", "save", "edit", "delete"]}
    >
        <BuildDisplay
            identityIds={build.identity_ids}
            egoIds={build.ego_ids}
            identityUpties={identityUpties}
            identityLevels={identityLevels}
            egoThreadspins={egoThreadspins}
            deploymentOrder={build.deployment_order}
            activeSinners={build.active_sinners}
            displayType={displayType}
        />
        <div style={{ display: "flex", alignItems: "center" }}>
            <SinDistribution
                identityIds={build.identity_ids}
                identityUpties={identityUpties}
                deploymentOrder={build.deployment_order}
                activeSinners={build.active_sinners}
                alignment="start"
            />
            <TeamCodeComponent teamCode={teamCode} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>Description</span>
            <div>
                <MarkdownRenderer content={build.body} />
            </div>
            {build.youtube_video_id ?
                <div style={{ display: "flex", paddingTop: "1rem", alignSelf: "center", width: "100%", justifyContent: "center" }}>
                    <YouTubeThumbnailEmbed videoId={build.youtube_video_id} />
                </div> :
                null
            }
        </div>
    </ContentPageTemplate>
}
