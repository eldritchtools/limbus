"use client";

import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useEffect, useMemo, useState } from "react";

import BuildDisplay from "../build/BuildDisplay";
import styles from "../build/BuildDisplay.module.css";
import BuildDisplayMenuCard from "../build/BuildDisplayMenuCard";
import DeploymentComponent from "../build/DeploymentComponent";
import DisplayTypeButton from "../build/DisplayTypeButton";
import Distribution from "../build/Distribution";
import TeamCodeComponent from "../build/TeamCodeComponent";
import { useEgosWithUpcoming, useIdentitiesWithUpcoming } from "../dataHooks/upcoming";
import RarityIcon from "../icons/RarityIcon";
import MarkdownEditorWrapper from "../markdown/MarkdownEditorWrapper";
import EventRolls from "../mdPlans/EventRolls";
import { useModal } from "../modals/ModalProvider";
import DragContainer from "../objects/DragContainer";
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
    iconSwaps, setIconSwaps,
    sinnerNotes, setSinnerNotes,
    skillReplaces, setSkillReplaces,
    minimalEditor = false, replaceDeployment, insertPanel,
    defaultAdditionalToggle = false, includeEventRolls = false
}) {
    const { openSelectDeploymentModal } = useModal();
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
    const toggleIconSwap = index => setIconSwaps(prev => prev.includes(index) ? prev.filter(x => x !== index) : [...prev, index]);
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
                                return <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", minWidth: 0 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "repeat(5, 1fr)", width: "100%", boxSizing: "border-box", border: `1px ${deploymentColors[depType]} solid`, borderRadius: "0.5rem" }}>
                                        <div style={{ gridColumn: "1", gridRow: "1 / 5" }}>
                                            <IdentityMenuSelector 
                                                value={identities[identityIds[index]] || null} setValue={v => setIdentityId(v, index)} 
                                                options={identityOptions[index + 1]} num={index + 1} 
                                                uptie={identityUpties[index] === "" ? 4 : identityUpties[index]} swapIcon={iconSwaps.includes(index + 1)} 
                                            />
                                        </div>
                                        <div style={{ gridColumn: "1", gridRow: "5", alignItems: "stretch", justifyContent: "stretch" }}>
                                            {!minimalEditor ?
                                                <DeploymentComponent depType={depType} depIndex={depIndex} setOrder={setDeploymentOrder} sinnerId={index + 1} /> :
                                                replaceDeployment?.[index]
                                            }
                                        </div>
                                        {Array.from({ length: 5 }, (_, rank) =>
                                            <div key={rank} style={{ gridColumn: "2", gridRow: rank + 1 }}>
                                                <EgoMenuSelector value={egos[egoIds?.[index]?.[rank]] || null} setValue={v => setEgoId(v, index, rank)} options={egoOptions[index + 1][rank]} rank={rank} />
                                            </div>
                                        )}
                                    </div>
                                    {additionalToggle ? <>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
                                            <div style={{ gridColumn: "span 3", display: "flex", justifyContent: "center" }}>
                                                <NumberInputWithButtons
                                                    value={identityLevels[index]} setValue={v => setIdentityLevel(v, index)}
                                                    max={LEVEL_CAP} allowEmpty={true} inputStyle={{ padding: "4px" }}
                                                />
                                            </div>
                                            <UptieSelector value={identityUpties[index]} setValue={v => setIdentityUptie(v, index)} allowEmpty={true} />
                                            <button {...getGeneralTooltipProps("Swap identity icon used")}
                                                onClick={() => toggleIconSwap(index + 1)}
                                                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                                            >
                                                <ArrowPathIcon style={{ width: "1.25rem", height: "1.25rem", transform: "rotate(90deg)" }} />
                                            </button>
                                            {Array.from({ length: 5 }, (_, rank) =>
                                                <UptieSelector
                                                    key={rank}
                                                    value={egoThreadspins?.[index]?.[rank] ?? ''}
                                                    setValue={v => setEgoThreadspin(v, index, rank)}
                                                    allowEmpty={true}
                                                    emptyIcon={<RarityIcon rarity={egoRanks[rank]} alt={true} style={{ width: "100%", height: "auto" }} />}
                                                    maxUptie={egos[egoIds?.[index]?.[rank]]?.maxThreadspin ?? 4}
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
        <DragContainer style={{ alignSelf: "center", width: "max-content", maxWidth: "100%" }}>
            <div style={{ display: "flex", gap: ".5rem", width: "max-content" }}>
                {insertPanel ? insertPanel : null}
                {!minimalEditor ?
                    <BuildDisplayMenuCard>
                        <div>Display Type</div>
                        <DisplayTypeButton value={displayType} setValue={setDisplayType} includeEdit={true} />
                        <span className="sub-text" style={{ textAlign: "center" }}>Quickly view various details of selected identities and E.G.Os or change how the team is displayed.</span>
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
                        <span>Deployment</span>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span style={{ textAlign: "center" }}>Active<br />Sinners</span>
                            <NumberInputWithButtons value={activeSinners} setValue={setActiveSinners} min={1} max={12} />
                        </div>
                        <div>
                            <button onClick={() => setDeploymentOrder(_ => [])}>Reset Order</button>
                            <button onClick={
                                () => openSelectDeploymentModal({
                                    initialActive: deploymentOrder, identityIds, activeSinners, onSave: setDeploymentOrder
                                })
                            }>
                                Easy Menu
                            </button>
                        </div>
                    </BuildDisplayMenuCard> :
                    null
                }
                {!minimalEditor ?
                    <Distribution identityIds={identityIds} deploymentOrder={deploymentOrder} activeSinners={activeSinners} /> :
                    null
                }
                {includeEventRolls ?
                    <EventRolls identityIds={identityIds} identityUpties={identityUpties} deploymentOrder={deploymentOrder} activeSinners={activeSinners} /> :
                    null
                }
                <TeamCodeComponent teamCode={teamCode} setTeamCode={handleSetTeamCode} editable={true} />
            </div>
        </DragContainer>
    </div>
}