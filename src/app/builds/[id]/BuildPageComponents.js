"use client";

import { useEffect, useState } from "react";

import BuildPage from "./BuildPage";

import BuildDisplay from "@/app/components/build/BuildDisplay";
import BuildDisplayMenuCard from "@/app/components/build/BuildDisplayMenuCard";
import DisplayTypeButton from "@/app/components/build/DisplayTypeButton";
import Distribution from "@/app/components/build/Distribution";
import TeamCodeComponent from "@/app/components/build/TeamCodeComponent";
import DragContainer from "@/app/components/objects/DragContainer";
import { decodeBuildExtraOpts } from "@/app/lib/buildExtraOpts";
import { contentConfig } from "@/app/lib/contentConfig";
import { constructTeamCode } from "@/app/lib/teamCodeEncoding";
import useLocalState from "@/app/lib/useLocalState";

export function BuildPageLocalWrapper({ id }) {
    const [build, setBuild] = useState(null);

    useEffect(() => {
        if(build) return;

        const fetch = async () => {
            try {
                setBuild(await contentConfig.builds.local.get(Number(id)));
            } catch(e) {
                console.error("Unable to fetch build");
            }
        }

        fetch();
    }, [id, build]);

    return <BuildPage id={id} build={build} />
}

export function BuildDisplaySection({ build }) {
    const { identityLevels, identityUpties, egoThreadspins, sinnerNotes, iconSwaps } = decodeBuildExtraOpts(build.extra_opts);
    const teamCode = constructTeamCode(build.identity_ids, build.ego_ids, build.deployment_order);

    const [displayType, setDisplayType] = useLocalState("buildDisplayType", "names");

    return <>
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
                <BuildDisplayMenuCard width={240}>
                    <div>Display Type</div>
                    <DisplayTypeButton value={displayType} setValue={setDisplayType} />
                    <span className="sub-text" style={{ textAlign: "center" }}>Quickly view various details of selected identities and E.G.Os or change how the team is displayed.</span>
                    <TeamCodeComponent teamCode={teamCode} />
                </BuildDisplayMenuCard>
                <Distribution
                    identityIds={build.identity_ids}
                    identityUpties={identityUpties}
                    egoIds={build.ego_ids}
                    deploymentOrder={build.deployment_order}
                    activeSinners={build.active_sinners}
                />
            </div>
        </DragContainer>
    </>
}