"use client";

import { useEffect, useMemo, useState } from "react";

import EventRolls from "./EventRolls";
import BuildDisplay from "../build/BuildDisplay";
import BuildDisplayMenuCard from "../build/BuildDisplayMenuCard";
import DisplayTypeButton from "../build/DisplayTypeButton";
import Distribution from "../build/Distribution";
import TeamCodeComponent from "../build/TeamCodeComponent";
import { useEgosWithUpcoming, useIdentitiesWithUpcoming } from "../dataHooks/upcoming";
import BuildEditingComponent from "../editors/BuildEditingComponent";
import DragContainer from "../objects/DragContainer";

import { egoRankMapping } from "@/app/lib/constants";
import { constructTeamCode } from "@/app/lib/teamCodeEncoding";
import useLocalState from "@/app/lib/useLocalState";


export default function RecommendedSpecBuildDisplay({ identityIds, setIdentityIds, egoIds, setEgoIds, extraOpts, setExtraOpts, editable = false }) {
    const [identities, identitiesLoading] = useIdentitiesWithUpcoming();
    const [egos, egosLoading] = useEgosWithUpcoming();
    const [displayType, setDisplayType] = useLocalState("buildDisplayType", "names");
    const [dataConverted, setDataConverted] = useState(false);
    // const [additionalToggle, setAdditionalToggle] = useState(false);

    const identitiesConverted = useMemo(() => {
        if (identitiesLoading) return null;
        const newIdentityIds = Array.from({ length: 12 }, () => "");
        identityIds.forEach(id => { newIdentityIds[identities[id].sinnerId - 1] = id; });
        return newIdentityIds;
    }, [identities, identitiesLoading, identityIds]);

    const egosConverted = useMemo(() => {
        if (egosLoading) return null;
        const newEgoIds = Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => ""));
        egoIds.forEach(id => { newEgoIds[egos[id].sinnerId - 1][egoRankMapping[egos[id].rank]] = id; })
        return newEgoIds;
    }, [egos, egosLoading, egoIds]);

    const [optsConverted, additionalToggle, changed] = useMemo(() => {
        let addToggle = false;
        let changed = false;

        const newExtraOpts = { ...extraOpts };

        if (newExtraOpts.deploymentOrder === undefined) {
            newExtraOpts.deploymentOrder = [];
            changed = true;
        }
        if (newExtraOpts.activeSinners === undefined) {
            newExtraOpts.activeSinners = 7;
            changed = true;
        }
        if (newExtraOpts.identityUpties === undefined) {
            newExtraOpts.identityUpties = Array.from({ length: 12 }, () => "");
            changed = true;
        } else addToggle = true;
        if (newExtraOpts.identityLevels === undefined) {
            newExtraOpts.identityLevels = Array.from({ length: 12 }, () => "");
            changed = true;
        } else addToggle = true;
        if (newExtraOpts.egoThreadspins === undefined) {
            newExtraOpts.egoThreadspins = Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => ""));
            changed = true;
        } else addToggle = true;
        if (newExtraOpts.iconSwaps === undefined) {
            newExtraOpts.iconSwaps = [];
            changed = true;
        } else addToggle = true;
        if (newExtraOpts.sinnerNotes === undefined) {
            newExtraOpts.sinnerNotes = Array.from({ length: 12 }, () => "");
            changed = true;
        } else addToggle = true;
        if (newExtraOpts.skillReplaces === undefined) {
            newExtraOpts.skillReplaces = {};
            changed = true;
        } else addToggle = true;

        return [newExtraOpts, addToggle, changed];
    }, [extraOpts])

    const teamCode = useMemo(
        // additional guard in case react resets the data
        () => identitiesConverted && identitiesConverted.length === 12 ?
            constructTeamCode(identitiesConverted, egosConverted, optsConverted.deploymentOrder ?? []) :
            null,
        [identitiesConverted, egosConverted, optsConverted]
    );

    useEffect(() => {
        if (!changed || !editable) return;

        if (changed && setExtraOpts) setExtraOpts(optsConverted);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDataConverted(true);
    }, [changed, optsConverted, setExtraOpts, dataConverted, editable]);

    if (!identitiesConverted || !egosConverted) return null;

    if (editable) {
        const handleSetIdentityIds = fn => setIdentityIds(fn(identitiesConverted));
        const handleSetEgoIds = fn => setEgoIds(fn(egosConverted));
        const handleOptsFunction = (func, key) => setExtraOpts(p => ({ ...p, [key]: func(p[key]) }));
        const handleOptsValue = (v, key) => setExtraOpts(p => ({ ...p, [key]: v }));

        return <BuildEditingComponent
            identityIds={identitiesConverted} setIdentityIds={handleSetIdentityIds}
            egoIds={egosConverted} setEgoIds={handleSetEgoIds}
            deploymentOrder={optsConverted.deploymentOrder} setDeploymentOrder={f => handleOptsFunction(f, "deploymentOrder")}
            activeSinners={optsConverted.activeSinners} setActiveSinners={v => handleOptsValue(v, "activeSinners")}
            identityLevels={optsConverted.identityLevels} setIdentityLevels={f => handleOptsFunction(f, "identityLevels")}
            identityUpties={optsConverted.identityUpties} setIdentityUpties={f => handleOptsFunction(f, "identityUpties")}
            egoThreadspins={optsConverted.egoThreadspins} setEgoThreadspins={f => handleOptsFunction(f, "egoThreadspins")}
            iconSwaps={optsConverted.iconSwaps} setIconSwaps={f => handleOptsFunction(f, "iconSwaps")}
            sinnerNotes={optsConverted.sinnerNotes} setSinnerNotes={f => handleOptsFunction(f, "sinnerNotes")}
            skillReplaces={optsConverted.skillReplaces} setSkillReplaces={f => handleOptsFunction(f, "skillReplaces")}
            defaultAdditionalToggle={additionalToggle} includeEventRolls={true}
        />
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <BuildDisplay
            identityIds={identitiesConverted}
            egoIds={egosConverted}
            identityUpties={optsConverted.identityUpties}
            identityLevels={optsConverted.identityLevels}
            egoThreadspins={optsConverted.egoThreadspins}
            iconSwaps={optsConverted.iconSwaps}
            sinnerNotes={optsConverted.sinnerNotes}
            skillReplaces={optsConverted.skillReplaces}
            deploymentOrder={optsConverted.deploymentOrder}
            activeSinners={optsConverted.activeSinners}
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
                    identityIds={identitiesConverted}
                    identityUpties={optsConverted.identityUpties}
                    egoIds={egosConverted}
                    deploymentOrder={optsConverted.deploymentOrder}
                    activeSinners={optsConverted.activeSinners}
                />
                <EventRolls
                    identityIds={identitiesConverted}
                    identityUpties={optsConverted.identityUpties}
                    deploymentOrder={optsConverted.deploymentOrder}
                    activeSinners={optsConverted.activeSinners}
                />
            </div>
        </DragContainer>
    </div>
}