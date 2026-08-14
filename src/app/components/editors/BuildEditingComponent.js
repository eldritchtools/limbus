"use client";

import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useEffect, useMemo, useRef, useState } from "react";

import BuildDisplay from "../build/BuildDisplay";
import styles from "../build/BuildDisplay.module.css";
import BuildDisplayMenuCard from "../build/BuildDisplayMenuCard";
import DeploymentComponent from "../build/DeploymentComponent";
import DisplayTypeButton from "../build/DisplayTypeButton";
import Distribution from "../build/Distribution";
import PassiveSearch from "../build/PassiveSearch";
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

import { deploymentColors, uiColors } from "@/app/lib/colors";
import { egoRankMapping, egoRanks, LEVEL_CAP } from "@/app/lib/constants";
import { getDeploymentPosition } from "@/app/lib/deploymentOrder";

function SinnerEditableComponent({
    build, buildRef, index,
    identities, identityOptions, egos, egoOptions,
    additionalToggle, minimalEditor, replaceDeployment
}) {
    const { openAltOptionsModal } = useModal();
    const [depType, depIndex] = getDeploymentPosition(build.deploymentOrder, build.activeSinners, index + 1);
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", minWidth: 0 }}>
        <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "repeat(5, 1fr)",
            width: "100%", boxSizing: "border-box", border: `1px ${deploymentColors[depType]} solid`, borderRadius: "0.5rem"
        }}>
            <div style={{ gridColumn: "1", gridRow: "1 / 5" }}>
                <IdentityMenuSelector
                    value={identities[build.identityIds[index]] || null}
                    setValue={v => build.setIdentityIdAt(index, v)}
                    options={identityOptions[index + 1]} num={index + 1}
                    uptie={(!build.identityUpties || build.identityUpties?.[index] === "") ? 4 : build.identityUpties[index]}
                    swapIcon={build.iconSwaps?.includes(index + 1)}
                />
            </div>
            <div style={{ gridColumn: "1", gridRow: "5", alignItems: "stretch", justifyContent: "stretch" }}>
                {!minimalEditor ?
                    <div style={{ display: "flex", alignItems: "stretch", height: "100%", boxSizing: "border-box" }}>
                        <button
                            style={{ position: "relative", margin: 0, padding: "0 6px", borderRadius: "0.5rem" }}
                            {...getGeneralTooltipProps("Add alternative options for this sinner.")}
                            onClick={() => openAltOptionsModal({ buildRef, index, editable: true })}
                        >
                            <span>+</span>
                            {build.altOptions[index].length > 0 &&
                                <span style={{
                                    position: "absolute", "top": "-5px", right: "-5px",
                                    background: uiColors.red, color: "#ddd", fontWeight: "bold",
                                    borderRadius: "50%", fontSize: ".75rem", padding: "2px 5px"
                                }}>
                                    {build.altOptions[index].length}
                                </span>
                            }
                        </button>
                        <DeploymentComponent
                            depType={depType} depIndex={depIndex}
                            setOrder={build.setDeploymentOrder} sinnerId={index + 1}
                        />
                    </div> :
                    replaceDeployment?.[index]
                }
            </div>
            {Array.from({ length: 5 }, (_, rank) =>
                <div key={rank} style={{ gridColumn: "2", gridRow: rank + 1 }}>
                    <EgoMenuSelector
                        value={egos[build.egoIds[index][rank]] || null}
                        setValue={v => build.setEgoIdAt(index, rank, v)}
                        options={egoOptions[index + 1][rank]} rank={rank}
                    />
                </div>
            )}
        </div>
        {additionalToggle ? <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
                <div style={{ gridColumn: "span 3", display: "flex", justifyContent: "center" }}>
                    <NumberInputWithButtons
                        value={build.identityLevels[index]} setValue={v => build.setIdentityLevel(index, v)}
                        max={LEVEL_CAP} allowEmpty={true} inputStyle={{ padding: "4px" }}
                    />
                </div>
                <UptieSelector
                    value={build.identityUpties[index]}
                    setValue={v => build.setIdentityUptie(index, v)}
                    allowEmpty={true}
                />
                <button {...getGeneralTooltipProps("Swap identity icon used")}
                    onClick={() => build.toggleIconSwap(index + 1)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                >
                    <ArrowPathIcon style={{ width: "1.25rem", height: "1.25rem", transform: "rotate(90deg)" }} />
                </button>
                {Array.from({ length: 5 }, (_, rank) =>
                    <UptieSelector
                        key={rank}
                        value={build.egoThreadspins[index][rank]}
                        setValue={v => build.setEgoThreadspin(index, rank, v)}
                        allowEmpty={true}
                        emptyIcon={<RarityIcon rarity={egoRanks[rank]} alt={true} style={{ width: "100%", height: "auto" }} />}
                        maxUptie={egos[build.egoIds[index][rank]]?.maxThreadspin ?? 4}
                    />)}
            </div>
            {build.skillReplaces[index + 1] ?
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    Skills: <SkillReplace
                        counts={build.skillReplaces[index + 1] ?? "321"}
                        setCounts={x => build.setSkillReplace(index + 1, x)}
                        editable={true}
                    />
                </div> :
                null
            }
            <div style={{ width: "100%" }}>
                <MarkdownEditorWrapper
                    value={build.sinnerNotes[index]}
                    onChange={v => build.setSinnerNote(index, v)}
                    placeholder={"Additional notes for this sinner..."}
                    mini={true} short={true}
                />
            </div>
        </> : null}
    </div>
}

export default function BuildEditingComponent({
    build, minimalEditor = false, replaceDeployment, insertPanel,
    defaultAdditionalToggle = false, includeEventRolls = false
}) {
    const { openSelectDeploymentModal } = useModal();
    const [identities, identitiesLoading] = useIdentitiesWithUpcoming();
    const [egos, egosLoading] = useEgosWithUpcoming();

    const [additionalToggle, setAdditionalToggle] = useState(defaultAdditionalToggle);
    const [allIdEgoToggle, setAllIdEgoToggle] = useState(false);
    const [passiveSearchToggle, setPassiveSearchToggle] = useState(false);
    const [displayType, setDisplayType] = useState("edit");

    const buildRef = useRef(build);
    useEffect(() => { buildRef.current = build }, [build]);

    const identityOptions = useMemo(() => {
        if (identitiesLoading) return [];
        return Object.entries(identities).reverse().reduce((acc, [_, identity]) => {
            acc[identity.sinnerId].push(identity); return acc;
        }, Object.fromEntries(Array.from({ length: 12 }, (_, index) => [index + 1, []])));
    }, [identities, identitiesLoading]);

    const egoOptions = useMemo(() => {
        if (egosLoading) return [];
        return Object.entries(egos).reverse().reduce((acc, [_, ego]) => {
            if (ego.rank) acc[ego.sinnerId][egoRankMapping[ego.rank]].push(ego);
            return acc;
        }, Object.fromEntries(Array.from({ length: 12 }, (_, index) => [index + 1, Array.from({ length: 5 }, () => [])])));
    }, [egos, egosLoading]);

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {identitiesLoading || egosLoading ? null :
            (
                displayType === "edit" ?
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <div className={styles.buildDisplay} style={{ alignSelf: "center" }}>
                            {Array.from({ length: 12 }, (_, index) =>
                                <SinnerEditableComponent
                                    key={index}
                                    build={build} buildRef={buildRef} index={index}
                                    identities={identities} egos={egos}
                                    identityOptions={identityOptions} egoOptions={egoOptions}
                                    additionalToggle={additionalToggle}
                                    minimalEditor={minimalEditor} replaceDeployment={replaceDeployment}
                                />
                            )}
                        </div>
                        {
                            allIdEgoToggle &&
                            <AllIdEgoSelector
                                identityIds={build.identityIds}
                                egoIds={build.egoIds}
                                setIdentityId={build.setIdentityId}
                                setEgoId={build.setEgoId}
                                identityOptions={identities}
                                egoOptions={egos}
                            />
                        }
                        {
                            passiveSearchToggle &&
                            <PassiveSearch setIdentityId={build.setIdentityId} setEgoId={build.setEgoId} />
                        }
                    </div> :
                    <BuildDisplay build={build} displayType={displayType} />
            )
        }
        <DragContainer style={{ alignSelf: "center", width: "max-content", maxWidth: "100%" }}>
            <div style={{ display: "flex", gap: ".5rem", width: "max-content" }}>
                {insertPanel ? insertPanel : null}
                {!minimalEditor ?
                    <BuildDisplayMenuCard width={240}>
                        <div>Display Type</div>
                        <DisplayTypeButton value={displayType} setValue={setDisplayType} includeEdit={true} />
                        <span className="sub-text" style={{ textAlign: "center" }}>
                            Quickly view various details of selected identities and E.G.Os or change how the team is displayed.
                        </span>
                        <TeamCodeComponent teamCode={build.teamCode} setTeamCode={build.setTeamCode} editable={true} />
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
                        onClick={() => { setAllIdEgoToggle(p => !p); setPassiveSearchToggle(false); }}
                        {...getGeneralTooltipProps("allIdEgoMenu")}
                        style={{ fontSize: "0.95rem" }}
                    >
                        Toggle All Ids & E.G.Os Menu
                    </button>
                    {!minimalEditor &&
                        <button
                            className={`toggle-button ${passiveSearchToggle ? "active" : ""}`}
                            onClick={() => { setPassiveSearchToggle(p => !p); setAllIdEgoToggle(false); }}
                            style={{ fontSize: "0.95rem" }}
                        >
                            Toggle Passive Search
                        </button>
                    }
                    {!minimalEditor && <>
                        <span style={{ marginTop: "0.5rem" }}>Deployment</span>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span style={{ textAlign: "center" }}>Active<br />Sinners</span>
                            <NumberInputWithButtons value={build.activeSinners} setValue={build.setActiveSinners} min={1} max={12} />
                        </div>
                        <div>
                            <button onClick={() => setDeploymentOrder(_ => [])}>Reset Order</button>
                            <button onClick={
                                () => openSelectDeploymentModal({
                                    initialActive: build.deploymentOrder,
                                    identityIds: build.identityIds,
                                    activeSinners: build.activeSinners,
                                    onSave: build.setDeploymentOrder
                                })
                            }>
                                Easy Menu
                            </button>
                        </div>
                    </>}
                </BuildDisplayMenuCard>
                {!minimalEditor && <Distribution build={build} />}
                {includeEventRolls && <EventRolls build={build} />}
                {minimalEditor &&
                    <BuildDisplayMenuCard>
                        <TeamCodeComponent teamCode={build.teamCode} setTeamCode={build.setTeamCode} />
                    </BuildDisplayMenuCard>
                }
            </div>
        </DragContainer>
    </div>
}