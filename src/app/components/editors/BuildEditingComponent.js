"use client";

import { useEffect, useMemo, useState } from "react";

import BuildDisplay from "../build/BuildDisplay";
import styles from "../build/BuildDisplay.module.css";
import BuildDisplayMenuCard from "../build/BuildDisplayMenuCard";
import DeploymentComponent from "../build/DeploymentComponent";
import DisplayTypeButton from "../build/DisplayTypeButton";
import SinDistribution from "../build/SinDistribution";
import TeamCodeComponent from "../build/TeamCodeComponent";
import { useEgosWithUpcoming, useIdentitiesWithUpcoming } from "../dataHooks/upcoming";
import RarityIcon from "../icons/RarityIcon";
import MarkdownEditorWrapper from "../markdown/MarkdownEditorWrapper";
import EventRolls from "../mdPlans/EventRolls";
import NumberInputWithButtons from "../objects/NumberInputWithButtons";
import AllIdEgoSelector from "../selectors/AllIdEgoSelector";
import { EgoMenuSelector } from "../selectors/EgoSelectors";
import { IdentityMenuSelector } from "../selectors/IdentitySelectors";
import UptieSelector from "../selectors/UptieSelector";
import SkillReplace from "../skill/SkillReplace";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { deploymentColors } from "@/app/lib/colors";
import { egoRankMapping, egoRanks, LEVEL_CAP } from "@/app/lib/constants";
import { getDeploymentPosition } from "@/app/lib/deploymentOrder";
import { constructTeamCode, parseTeamCode } from "@/app/lib/teamCodeEncoding";

export default function BuildEditingComponent({
    identityIds, setIdentityIds,
    egoIds, setEgoIds,
    deploymentOrder, setDeploymentOrder,
    activeSinners, setActiveSinners,
    identityLevels, setIdentityLevels,
    identityUpties, setIdentityUpties,
    egoThreadspins, setEgoThreadspins,
    sinnerNotes, setSinnerNotes,
    skillReplaces, setSkillReplaces,
    minimalEditor = false, replaceDeployment, insertPanel,
    defaultAdditionalToggle = false, includeEventRolls = false
}) {
    const [identities, identitiesLoading] = useIdentitiesWithUpcoming();
    const [egos, egosLoading] = useEgosWithUpcoming();

    const [teamCode, setTeamCode] = useState('');
    const [additionalToggle, setAdditionalToggle] = useState(defaultAdditionalToggle);
    const [allIdEgoToggle, setAllIdEgoToggle] = useState(false);
    const [displayType, setDisplayType] = useState("edit");

    const identityOptions = useMemo(() => {
        if (identitiesLoading) return [];
        return Object.entries(identities).reverse().reduce((acc, [_, identity]) => {
            acc[identity.sinnerId].push(identity); return acc;
        }, Object.fromEntries(Array.from({ length: 12 }, (_, index) => [index + 1, []])));
    }, [identities, identitiesLoading]);

    const setIdentityId = (identityId, index) => setIdentityIds(prev => prev.map((x, i) => i === index ? identityId : x));

    const egoOptions = useMemo(() => {
        if (egosLoading) return [];
        return Object.entries(egos).reverse().reduce((acc, [_, ego]) => {
            if (ego.rank) acc[ego.sinnerId][egoRankMapping[ego.rank]].push(ego);
            return acc;
        }, Object.fromEntries(Array.from({ length: 12 }, (_, index) => [index + 1, Array.from({ length: 5 }, () => [])])));
    }, [egos, egosLoading]);

    const setEgoId = (egoId, index, rank) => setEgoIds(prev => prev.map((x, i) => i === index ? x.map((y, r) => r === rank ? egoId : y) : x));

    const setIdentityLevel = (level, index) => setIdentityLevels(prev => prev.map((x, i) => i === index ? level : x));
    const setIdentityUptie = (uptie, index) => setIdentityUpties(prev => prev.map((x, i) => i === index ? uptie : x));
    const setEgoThreadspin = (uptie, index, rank) => setEgoThreadspins(prev => prev.map((x, i) => i === index ? x.map((y, r) => r === rank ? uptie : y) : x));
    const setSinnerNote = (note, index) => setSinnerNotes(prev => prev.map((x, i) => i === index ? note : x));
    const setSkillReplace = (rep, index) => setSkillReplaces(prev => ({ ...prev, [index]: rep }));

    useEffect(() => {
        const teamCode = constructTeamCode(identityIds, egoIds, deploymentOrder);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTeamCode(teamCode);
    }, [identityIds, egoIds, deploymentOrder]);

    const handleSetTeamCode = (v) => {
        setTeamCode(v);
        const parseResult = parseTeamCode(v);
        if (!parseResult) return;
        setDeploymentOrder([...parseResult.deploymentOrder]);
        setIdentityIds([...parseResult.identities]);
        setEgoIds(parseResult.egos.map(egos => [...egos]));
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {identitiesLoading || egosLoading ? null :
            (
                displayType === "edit" ?
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <div className={styles.buildDisplay} style={{ alignSelf: "center" }}>
                            {Array.from({ length: 12 }, (_, index) => {
                                const [depType, depIndex] = getDeploymentPosition(deploymentOrder, activeSinners, index + 1);
                                return <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", boxSizing: "border-box", border: `1px ${deploymentColors[depType]} solid` }}>
                                        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
                                            <IdentityMenuSelector value={identities[identityIds[index]] || null} setValue={v => setIdentityId(v, index)} options={identityOptions[index + 1]} num={index + 1} />
                                            {!minimalEditor ?
                                                <DeploymentComponent depType={depType} depIndex={depIndex} setOrder={setDeploymentOrder} sinnerId={index + 1} /> :
                                                replaceDeployment?.[index]
                                            }
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
                                            {Array.from({ length: 5 }, (_, rank) =>
                                                <EgoMenuSelector key={rank} value={egos[egoIds[index][rank]] || null} setValue={v => setEgoId(v, index, rank)} options={egoOptions[index + 1][rank]} rank={rank} />
                                            )}
                                        </div>
                                    </div>
                                    {additionalToggle ? <>
                                        <div style={{ display: "flex" }}>
                                            <NumberInputWithButtons value={identityLevels[index]} setValue={v => setIdentityLevel(v, index)} max={LEVEL_CAP} allowEmpty={true} />
                                            <UptieSelector value={identityUpties[index]} setValue={v => setIdentityUptie(v, index)} allowEmpty={true} />
                                        </div>
                                        <div style={{ display: "flex" }}>
                                            {Array.from({ length: 5 }, (_, rank) =>
                                                <UptieSelector
                                                    key={rank}
                                                    value={egoThreadspins[index][rank]}
                                                    setValue={v => setEgoThreadspin(v, index, rank)}
                                                    allowEmpty={true}
                                                    emptyIcon={<RarityIcon rarity={egoRanks[rank]} alt={true} style={{ width: "100%", height: "auto" }} />}
                                                />)}
                                        </div>
                                        {skillReplaces ?
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                                                Skills: <SkillReplace counts={skillReplaces[index + 1] ?? "321"} setCounts={x => setSkillReplace(x, index + 1)} editable={true} />
                                            </div> :
                                            null
                                        }
                                        <div style={{ width: "100%" }}>
                                            <MarkdownEditorWrapper
                                                value={sinnerNotes[index]}
                                                onChange={v => setSinnerNote(v, index)}
                                                placeholder={"Additional notes for this sinner..."}
                                                mini={true} short={true}
                                            />
                                        </div>
                                    </> : null}
                                </div>
                            })}
                        </div>
                        {
                            allIdEgoToggle ?
                                <AllIdEgoSelector
                                    identityIds={identityIds}
                                    egoIds={egoIds}
                                    setIdentityId={setIdentityId}
                                    setEgoId={setEgoId}
                                    identityOptions={identities}
                                    egoOptions={egos}
                                /> : null
                        }
                    </div> :
                    <BuildDisplay
                        identityIds={identityIds}
                        egoIds={egoIds}
                        identityUpties={identityUpties}
                        identityLevels={identityLevels}
                        egoThreadspins={egoThreadspins}
                        sinnerNotes={sinnerNotes}
                        deploymentOrder={deploymentOrder}
                        activeSinners={activeSinners}
                        displayType={displayType}
                    />
            )
        }
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            {insertPanel ? insertPanel : null}
            {!minimalEditor ?
                <BuildDisplayMenuCard>
                    <div>Display Type</div>
                    <DisplayTypeButton value={displayType} setValue={setDisplayType} includeEdit={true} />
                </BuildDisplayMenuCard> :
                null
            }
            <BuildDisplayMenuCard>
                {!minimalEditor ?
                    <button
                        className={`toggle-button ${additionalToggle ? "active" : ""}`}
                        onClick={() => setAdditionalToggle(p => !p)}
                        {...getGeneralTooltipProps("additionalDetails")}
                        style={{ fontSize: "0.95rem" }}
                    >
                        Toggle Additional Details
                    </button> :
                    <>
                        <div>Display Type</div>
                        <DisplayTypeButton value={displayType} setValue={setDisplayType} includeEdit={true} />
                    </>
                }
                <button
                    className={`toggle-button ${allIdEgoToggle ? "active" : ""}`}
                    onClick={() => setAllIdEgoToggle(p => !p)}
                    {...getGeneralTooltipProps("allIdEgoMenu")}
                    style={{ fontSize: "0.95rem" }}
                >
                    Toggle All Ids & E.G.Os Menu
                </button>
            </BuildDisplayMenuCard>
            {!minimalEditor ?
                <BuildDisplayMenuCard>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ textAlign: "center" }}>Active Sinners</span>
                        <NumberInputWithButtons value={activeSinners} setValue={setActiveSinners} min={1} max={12} />
                    </div>
                    <button onClick={() => setDeploymentOrder([])} style={{ fontSize: "1rem" }}>Reset Deployment Order</button>
                </BuildDisplayMenuCard> :
                null
            }
            {!minimalEditor ?
                <SinDistribution identityIds={identityIds} deploymentOrder={deploymentOrder} activeSinners={activeSinners} /> :
                null
            }
            {includeEventRolls ?
                <EventRolls identityIds={identityIds} identityUpties={identityUpties} deploymentOrder={deploymentOrder} activeSinners={activeSinners} /> :
                null
            }
            <TeamCodeComponent teamCode={teamCode} setTeamCode={handleSetTeamCode} editable={true} />
        </div>
    </div>
}