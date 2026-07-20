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

import { egoRankMapping } from "@/app/lib/constants";
import { constructTeamCode } from "@/app/lib/teamCodeEncoding";
import useLocalState from "@/app/lib/useLocalState";


export default function RecommendedSpecBuildDisplay({ identityIds, setIdentityIds, egoIds, setEgoIds, extraOpts, setExtraOpts, editable = false }) {
    const [identities, identitiesLoading] = useIdentitiesWithUpcoming();
    const [egos, egosLoading] = useEgosWithUpcoming();
    const [displayType, setDisplayType] = useLocalState("buildDisplayType", "names");
    const [dataConverted, setDataConverted] = useState(false);
    const [additionalToggle, setAdditionalToggle] = useState(false);

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

    const teamCode = useMemo(
        // additional guard in case react resets the data
        () => dataConverted && identitiesConverted.length === 12 ?
            constructTeamCode(identitiesConverted, egoIds, extraOpts.deploymentOrder ?? []) :
            null,
        [identitiesConverted, egoIds, extraOpts, dataConverted]
    );

    useEffect(() => {
        if (identitiesLoading || egosLoading) return;

        const newExtraOpts = { ...extraOpts };
        let setNew = false;

        if (newExtraOpts.deploymentOrder === undefined) {
            newExtraOpts.deploymentOrder = [];
            setNew = true;
        }
        if (newExtraOpts.activeSinners === undefined) {
            newExtraOpts.activeSinners = 7;
            setNew = true;
        }
        if (newExtraOpts.identityUpties === undefined) {
            newExtraOpts.identityUpties = Array.from({ length: 12 }, () => "");
            setNew = true;
        } else setAdditionalToggle(true);
        if (newExtraOpts.identityLevels === undefined) {
            newExtraOpts.identityLevels = Array.from({ length: 12 }, () => "");
            setNew = true;
        } else setAdditionalToggle(true);
        if (newExtraOpts.egoThreadspins === undefined) {
            newExtraOpts.egoThreadspins = Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => ""));
            setNew = true;
        } else setAdditionalToggle(true);
        if (newExtraOpts.sinnerNotes === undefined) {
            newExtraOpts.sinnerNotes = Array.from({ length: 12 }, () => "");
            setNew = true;
        } else setAdditionalToggle(true);
        if (newExtraOpts.skillReplaces === undefined) {
            newExtraOpts.skillReplaces = {};
            setNew = true;
        } else setAdditionalToggle(true);

        if (setNew) setExtraOpts(newExtraOpts);
        setDataConverted(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [identitiesLoading, egosLoading, editable]);

    if (!dataConverted || !identitiesConverted || !egosConverted) return null;

    if (editable) {
        const handleSetIdentityIds = fn => setIdentityIds(fn(identitiesConverted));
        const handleSetEgoIds = fn => setEgoIds(fn(egosConverted));
        const handleOptsFunction = (func, key) => setExtraOpts(p => ({ ...p, [key]: func(p[key]) }));
        const handleOptsValue = (v, key) => setExtraOpts(p => ({ ...p, [key]: v }));

        return <BuildEditingComponent
            identityIds={identitiesConverted} setIdentityIds={handleSetIdentityIds}
            egoIds={egosConverted} setEgoIds={handleSetEgoIds}
            deploymentOrder={extraOpts.deploymentOrder} setDeploymentOrder={f => handleOptsFunction(f, "deploymentOrder")}
            activeSinners={extraOpts.activeSinners} setActiveSinners={v => handleOptsValue(v, "activeSinners")}
            identityLevels={extraOpts.identityLevels} setIdentityLevels={f => handleOptsFunction(f, "identityLevels")}
            identityUpties={extraOpts.identityUpties} setIdentityUpties={f => handleOptsFunction(f, "identityUpties")}
            egoThreadspins={extraOpts.egoThreadspins} setEgoThreadspins={f => handleOptsFunction(f, "egoThreadspins")}
            sinnerNotes={extraOpts.sinnerNotes} setSinnerNotes={f => handleOptsFunction(f, "sinnerNotes")}
            skillReplaces={extraOpts.skillReplaces} setSkillReplaces={f => handleOptsFunction(f, "skillReplaces")}
            defaultAdditionalToggle={additionalToggle} includeEventRolls={true}
        />
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <BuildDisplay
            identityIds={identitiesConverted}
            egoIds={egosConverted}
            identityUpties={extraOpts.identityUpties}
            identityLevels={extraOpts.identityLevels}
            egoThreadspins={extraOpts.egoThreadspins}
            sinnerNotes={extraOpts.sinnerNotes}
            skillReplaces={extraOpts.skillReplaces}
            deploymentOrder={extraOpts.deploymentOrder}
            activeSinners={extraOpts.activeSinners}
            displayType={displayType}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <BuildDisplayMenuCard>
                <div>Display Type</div>
                <DisplayTypeButton value={displayType} setValue={setDisplayType} />
                <span className="sub-text" style={{ textAlign: "center" }}>Quickly view various details of selected identities and E.G.Os or change how the team is displayed.</span>
            </BuildDisplayMenuCard>
            <Distribution
                identityIds={identitiesConverted}
                identityUpties={extraOpts.identityUpties}
                egoIds={egosConverted}
                deploymentOrder={extraOpts.deploymentOrder}
                activeSinners={extraOpts.activeSinners}
            />
            <EventRolls
                identityIds={identitiesConverted}
                identityUpties={extraOpts.identityUpties}
                deploymentOrder={extraOpts.deploymentOrder}
                activeSinners={extraOpts.activeSinners}
            />
            <TeamCodeComponent teamCode={teamCode} />
        </div>
    </div>
}