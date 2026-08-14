"use client";

import { useEffect, useMemo, useState } from "react";

import EventRolls from "./EventRolls";
import BuildDisplay from "../build/BuildDisplay";
import BuildDisplayMenuCard from "../build/BuildDisplayMenuCard";
import DisplayTypeButton from "../build/DisplayTypeButton";
import Distribution from "../build/Distribution";
import TeamCodeComponent from "../build/TeamCodeComponent";
import { useEgosWithUpcoming, useIdentitiesWithUpcoming } from "../dataHooks/upcoming";
import useBuildState from "../dataHooks/useBuildState";
import BuildEditingComponent from "../editors/BuildEditingComponent";
import DragContainer from "../objects/DragContainer";

import { egoRankMapping } from "@/app/lib/constants";
import useLocalState from "@/app/lib/useLocalState";


export default function RecommendedSpecBuildDisplay({ identityIds, setIdentityIds, egoIds, setEgoIds, extraOpts, setExtraOpts, editable = false }) {
    const [identities, identitiesLoading] = useIdentitiesWithUpcoming();
    const [egos, egosLoading] = useEgosWithUpcoming();
    const [displayType, setDisplayType] = useLocalState("buildDisplayType", "names");
    const [dataConverted, setDataConverted] = useState(false);

    const build = useBuildState();

    const additionalToggle = useMemo(() => {
        return extraOpts.identityUpties !== undefined ||
            extraOpts.identityLevels !== undefined ||
            extraOpts.egoThreadspins !== undefined ||
            extraOpts.iconSwaps !== undefined ||
            extraOpts.sinnerNotes !== undefined ||
            extraOpts.altOptions !== undefined ||
            extraOpts.skillReplaces !== undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if(dataConverted || identitiesLoading || egosLoading) return;

        const newIdentityIds = Array.from({ length: 12 }, () => "");
        identityIds.forEach(id => { newIdentityIds[identities[id].sinnerId - 1] = id; });

        const newEgoIds = Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => ""));
        egoIds.forEach(id => { newEgoIds[egos[id].sinnerId - 1][egoRankMapping[egos[id].rank]] = id; });

        build.setBuildState({
            identityIds: newIdentityIds,
            egoIds: newEgoIds,
            deploymentOrder: extraOpts.deploymentOrder,
            activeSinners: extraOpts.activeSinners,
            decodedExtraOpts: extraOpts
        });

        setDataConverted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [identitiesLoading, egosLoading, dataConverted]);

    useEffect(() => {
        if(!dataConverted) return;

        if(setIdentityIds) setIdentityIds(build.identityIds);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [build.identityIds]);

    useEffect(() => {
        if(!dataConverted) return;

        if(setEgoIds) setEgoIds(build.egoIds);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [build.egoIds]);

    useEffect(() => {
        if(!dataConverted) return;

        if(setExtraOpts) setExtraOpts({
            deploymentOrder: build.deploymentOrder,
            activeSinners: build.activeSinners,
            identityLevels: build.identityLevels,
            identityUpties: build.identityUpties,
            egoThreadspins: build.egoThreadspins,
            iconSwaps: build.iconSwaps,
            sinnerNotes: build.sinnerNotes,
            altOptions: build.altOptions,
            skillReplaces: build.skillReplaces
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [build.deploymentOrder, build.activeSinners, 
        build.identityLevels, build.identityUpties, build.egoThreadspins, 
        build.iconSwaps, build.sinnerNotes, build.altOptions, build.skillReplaces
    ]);


    if (editable) {
        if(!dataConverted) return;

        return <BuildEditingComponent
            build={build}
            defaultAdditionalToggle={additionalToggle} 
            includeEventRolls={true}
        />
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <BuildDisplay build={build} displayType={displayType} />

        <DragContainer style={{ alignSelf: "center", width: "max-content", maxWidth: "100%" }}>
            <div style={{ display: "flex", gap: ".5rem", width: "max-content" }}>
                <BuildDisplayMenuCard width={240}>
                    <div>Display Type</div>
                    <DisplayTypeButton value={displayType} setValue={setDisplayType} />
                    <span className="sub-text" style={{ textAlign: "center" }}>
                        Quickly view various details of selected identities and E.G.Os or change how the team is displayed.
                    </span>
                    <TeamCodeComponent teamCode={build.teamCode} />
                </BuildDisplayMenuCard>
                <Distribution build={build} />
                <EventRolls build={build} />
            </div>
        </DragContainer>
    </div>
}