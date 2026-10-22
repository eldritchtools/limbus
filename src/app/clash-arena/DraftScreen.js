import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaVolumeUp } from "react-icons/fa";

import HoldButton from "./HoldButton";
import ParticipantGrid, { ParticipantTextGrid } from "./ParticipantsDisplay";
import PointsDisplay from "./PointsDisplay";
import { alerts, biasText } from "./util";
import { useData } from "../components/DataProvider";
import EgoIcon from "../components/icons/EgoIcon";
import Icon from "../components/icons/Icon";
import IdentityIcon from "../components/icons/IdentityIcon"
import KeywordIcon from "../components/icons/KeywordIcon";
import SkillIcon from "../components/icons/SkillIcon";
import MarkdownRenderer from "../components/markdown/MarkdownRenderer";
import NamePill from "../components/objects/NamePill";
import { EgoDropdownSelector } from "../components/selectors/EgoSelectors";
import { IdentityDropdownSelector } from "../components/selectors/IdentitySelectors"
import { useSiteCustomization } from "../components/SiteCustomizationProvider";
import ProcessedText from "../components/texts/ProcessedText";
import { getClashArenaDraftTooltipProps } from "../components/tooltips/ClashArenaDraftTooltip";
import { getClashArenaSkillTooltipProps } from "../components/tooltips/ClashArenaSkillTooltip";
import { getGeneralMarkdownTooltipProps } from "../components/tooltips/GeneralMarkdownTooltip";
import { sinnerIdMapping } from "../lib/constants";
import { AUDIO_ROOT } from "../paths";
import { selectStyleVariable } from "../styles/selectStyle"

function useAlertSound(initSound) {
    const context = useRef(null);
    const buffer = useRef(null);
    const gain = useRef(null);
    const [sound, setSound] = useState(initSound);

    useEffect(() => {
        if (!sound || sound === "none") return;
        const audioContext = new AudioContext();
        context.current = audioContext;

        const gainNode = audioContext.createGain();
        gainNode.gain.value = alerts[sound][1];
        gainNode.connect(audioContext.destination);
        gain.current = gainNode;

        fetch(`${AUDIO_ROOT}/alerts/${sound}.wav`)
            .then(response => response.arrayBuffer())
            .then(data => audioContext.decodeAudioData(data))
            .then(decoded => {
                buffer.current = decoded;
            });

        return () => audioContext.close();
    }, [sound]);

    return [
        useCallback(() => {
            if (!buffer.current || !sound || sound === "none") return;

            if (context.current.state === "suspended") {
                context.current.resume();
            }

            const source = context.current.createBufferSource();
            source.buffer = buffer.current;
            source.connect(gain.current);
            source.start();
        }, [sound]),
        setSound
    ];
}

function SkillsDisplay({ clashBattle, isEgo, itemId }) {
    const [egos] = useData("egos_mini");
    if (!itemId) return null;

    return <>
        {clashBattle.clashingData[itemId].modifierDesc &&
            <MarkdownRenderer content={clashBattle.clashingData[itemId].modifierDesc} />
        }

        {!isEgo &&
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "bold", textAlign: "center" }}>Factions</span>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                        {(clashBattle.clashingData[itemId].factions || []).map(x => <span key={x}
                            style={{ padding: "0.1rem 0.2rem", margin: "0.1rem 0.25rem", background: "var(--bg-hover)", borderRadius: "0.5rem" }}>
                            <ProcessedText text={x} />
                        </span>
                        )}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", textAlign: "center" }}>Keywords</span>
                    <div style={{ display: "flex", gap: "0.2rem", justifyContent: "center" }}>
                        {(clashBattle.clashingData[itemId].keywords || []).map(x => <KeywordIcon key={x} id={x} />)}
                    </div>
                    {(clashBattle.clashingData[itemId].keywordModifiers || []).map(({ keyword, ego: egoId }) => {
                        const ego = egos[egoId];
                        return <span key={keyword} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <KeywordIcon id={keyword} />
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", maxWidth: "65vw" }}>
                                <EgoIcon id={ego.id} type={"awaken"} displayName={false} scale={0.125} />
                                <span style={{ minWidth: 0, flex: 1 }}>[{sinnerIdMapping[ego.sinnerId]}] {ego.name}</span>
                            </div>
                        </span>
                    }
                    )}
                </div>
            </div>
        }

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${isEgo ? 2 : 3}, 1fr)`, gap: "1.5rem" }}>
            {
                (isEgo ? ["a", "c"] : [1, 2, 3]).map(skill => {
                    const skillData = clashBattle.clashingData[itemId][String(skill)]
                    if (!skillData) return null;

                    return <div key={skill}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}
                        {...getClashArenaSkillTooltipProps(itemId, skill, null)}
                    >
                        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                            <SkillIcon skillData={skillData} />
                            {!isEgo &&
                                <span style={{ color: "var(--secondary-text-color", fontSize: "2rem", fontWeight: "bold" }}>x{4 - skill}</span>
                            }
                        </div>
                        <div style={{ maxWidth: "200px", margin: "0 1.5rem", alignSelf: "start" }}>
                            <NamePill name={skillData.name} affinity={skillData.affinity} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                                {skillData.base} {skillData.coin > 0 ? "+" : ""}{skillData.coin}
                            </span>
                            &nbsp;
                            {Array.from({ length: skillData.coins }, (v, i) =>
                                <Icon style={{ width: "24px", height: "24px" }} key={i} path={"coin"} />
                            )}
                        </div>
                    </div>
                })
            }
        </div>
    </>
}

function BlacklistPhase({ clashBattle, itemId, setItemId, handleConfirm }) {
    if (clashBattle.picked)
        return <span>
            Waiting for everyone to choose: {clashBattle.chosenCount}/{clashBattle.participants.length}
        </span>

    return <>
        <span>Choose an identity to blacklist:</span>
        <div style={{ width: "min(100%, 1000px)" }}>
            <IdentityDropdownSelector
                selected={itemId} setSelected={x => setItemId(x)} styles={selectStyleVariable}
                options={
                    Object.entries(clashBattle.clashingData)
                        .filter(([, data]) => data.type === "id")
                        .filter(([id]) => !clashBattle.blacklist.includes(id))
                        .map(([id]) => id)
                }
                excludeOptions={clashBattle.getSelectedIdentities()}
                autoFocus={true}
            />
        </div>

        <SkillsDisplay clashBattle={clashBattle} isEgo={false} itemId={itemId} />

        {itemId ?
            <span className="text-link" onClick={handleConfirm}
                style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
            >
                Confirm choice
            </span> :
            <div style={{ display: "flex", flexDirection: "column" }}>
                <HoldButton onConfirm={handleConfirm} duration={1000}>
                    Pass
                </HoldButton>
                <span className="sub-text">Hold to pass</span>
            </div>
        }
    </>
}

function DraftPhase({ clashBattle, draftId, itemId, setItemId, pointsDisabled, isEgo, handleConfirm }) {
    if (clashBattle.mode === "standard" && draftId !== clashBattle.playerId)
        return <div style={{display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center"}}>
            {clashBattle.participants.find(x => x.player_id === draftId).display_name} is choosing...
            {clashBattle.isHost &&
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <HoldButton onConfirm={clashBattle.forceAdvanceDraft} duration={1000}>
                        Advance draft
                    </HoldButton>
                    <span className="sub-text">Hold to skip the current player&apos;s turn. Use for unresponsive players.</span>
                </div>
            }
        </div>

    if (clashBattle.mode === "battleRoyale" && clashBattle.picked) {
        if (clashBattle.isHost)
            return <>
                <span>Waiting for everyone to choose: {clashBattle.chosenCount}/{clashBattle.participants.length}</span>
                <span className="sub-text">Updated after every 10 players.</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <HoldButton onConfirm={clashBattle.forceAdvanceDraft} duration={1000}>
                        Advance draft round
                    </HoldButton>
                    <span className="sub-text">Hold to advance to the next draft round. Players who haven&apos;t chosen skip this draft.</span>
                </div>
            </>
        else
            return <>
                <span>Waiting for everyone to choose...</span>
            </>
    }

    return <>
        {!pointsDisabled &&
            <span>You currently have <span style={{ fontWeight: "bold" }}>{clashBattle.draftPoints}</span> points.</span>
        }
        <span>Choose an {isEgo ? "E.G.O" : "identity"}:</span>
        <div style={{ width: "min(100%, 1000px)" }}>
            {
                isEgo ?
                    <EgoDropdownSelector
                        selected={itemId} setSelected={x => setItemId(x)} styles={selectStyleVariable}
                        options={
                            Object.entries(clashBattle.clashingData)
                                .filter(([id]) => pointsDisabled || clashBattle.clashingData[id].points <= clashBattle.draftPoints)
                                .filter(([, data]) => data.type === "ego")
                                .map(([id]) => id)
                        }
                        excludeOptions={clashBattle.mode === "standard" ? clashBattle.getSelectedEgo() : []}
                        autoFocus={true}
                        nameAppendFunc={ego =>
                            pointsDisabled ? null :
                                ` (${clashBattle.clashingData[ego.id].points} points)`
                        }
                    /> :
                    <IdentityDropdownSelector
                        selected={itemId} setSelected={x => setItemId(x)} styles={selectStyleVariable}
                        options={
                            Object.entries(clashBattle.clashingData)
                                .filter(([id]) => pointsDisabled || clashBattle.clashingData[id].points <= clashBattle.draftPoints)
                                .filter(([id]) => !clashBattle.blacklist.includes(id))
                                .filter(([, data]) => data.type === "id")
                                .map(([id]) => id)
                        }
                        excludeOptions={clashBattle.mode === "standard" ? clashBattle.getSelectedIdentities() : clashBattle.getPlayerIdentities()}
                        autoFocus={true}
                        nameAppendFunc={identity =>
                            pointsDisabled ? null :
                                ` (${clashBattle.clashingData[identity.id].points} points)`
                        }
                    />
            }
        </div>

        <SkillsDisplay clashBattle={clashBattle} isEgo={isEgo} itemId={itemId} />

        {itemId && <>
            {
                !pointsDisabled &&
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    Cost: {clashBattle.clashingData[itemId].points} Points
                </span>
            }
            <span className="text-link" onClick={handleConfirm}
                style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
            >
                Confirm choice
            </span>
        </>
        }
    </>
}

export default function DraftScreen({ clashBattle }) {
    const { getCustomizationValue, setCustomizationValue } = useSiteCustomization();
    const [itemId, setItemId] = useState(null);
    const [playAlert, setPlayAlert] = useAlertSound(getCustomizationValue("alertSound"));

    const [isEgo, draftId] = useMemo(() => {
        if (clashBattle.mode === "standard") {
            const id = clashBattle.draftOrder[0];
            const isEgo = typeof id === "string" && id.startsWith("e-");
            const draftId = isEgo ? Number(id.slice(2)) : id;
            return [isEgo, draftId]
        } else {
            const id = clashBattle.draftOrder[0];
            return [id === "ego", id]
        }
    }, [clashBattle.draftOrder, clashBattle.mode])

    const handleConfirm = useCallback(() => {
        clashBattle.pickItem(itemId);
        setItemId(null);
    }, [clashBattle, itemId]);

    const pointsDisabled = clashBattle.settings["pointsPerDraft"] === 0;

    useEffect(() => {
        if (draftId === clashBattle.playerId || draftId === "blacklist") playAlert();
        if (clashBattle.mode === "battleRoyale") playAlert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftId, clashBattle.mode, clashBattle.draftIndex]);

    const playerEgo = clashBattle.getPlayerEgo();

    const settingsString = useMemo(() => {
        const pieces = [];
        pieces.push(`${clashBattle.settings["rounds"]} rounds`);
        pieces.push(`${clashBattle.settings["teamSize"]} identities`);
        if (clashBattle.settings["egoDraft"]) pieces.push("1 E.G.O");
        if (clashBattle.settings["pointsPerDraft"]) {
            if (clashBattle.settings["egoDraft"])
                pieces.push(`${clashBattle.settings["pointsPerDraft"]} points per identity (${Math.ceil(clashBattle.settings["pointsPerDraft"] / 2)} for E.G.O)`);
            else
                pieces.push(`${clashBattle.settings["pointsPerDraft"]} points per identity`);
        }

        pieces.push(`${biasText(clashBattle.settings["spBias"]).slice(0, -5)} SP bias`);
        return pieces.join(", ");
    }, [clashBattle.settings]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Clash Arena</h1>

        <span className="sub-text" style={{ maxWidth: "1000px", textAlign: "center", marginBottom: "1rem" }}>
            Note: Some skills and conditionals have been simplified or modified to better fit the mechanics and limitations of Clash Arena. Certain mechanics like resonance or deploying specific identities have been omitted entirely. Hover over a skill to see the conditionals currently implemented for it.
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <span className="hover-text" {...getGeneralMarkdownTooltipProps("The alert plays whenever it's your turn to draft.")}>
                Alert:
            </span>
            <select
                value={getCustomizationValue("alertSound")}
                onChange={e => {
                    setCustomizationValue("alertSound", e.target.value);
                    setPlayAlert(e.target.value)
                }}
            >
                {Object.entries(alerts).map(([id, [label]]) =>
                    <option key={id} value={id}>{label}</option>
                )}
            </select>
            <button onClick={playAlert}>
                <FaVolumeUp />
            </button>
        </div>

        <span>
            Game Settings: {settingsString}
        </span>

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Next Drafts</span>
        <div style={{ display: "flex", gap: "1rem" }}>
            {clashBattle.draftOrder.map((id, i) => {
                let displayName = id;
                if (clashBattle.mode === "battleRoyale") {
                    if (id === "identity") displayName = "Identity";
                    else displayName = "E.G.O";
                } else {
                    if (id === "blacklist") displayName = "Ban Phase";
                    else displayName = clashBattle.participants.find(
                        x => x.player_id === (typeof id === "string" && id.startsWith("e-") ? Number(id.slice(2)) : id)
                    ).display_name
                }

                return <span key={`${id}-${i}`}>
                    {i === 0 ? "▶" : ""} {displayName}
                </span>
            })}
        </div>

        {draftId === "blacklist" ?
            <BlacklistPhase clashBattle={clashBattle} itemId={itemId} setItemId={setItemId} handleConfirm={handleConfirm} /> :
            <DraftPhase
                clashBattle={clashBattle} draftId={draftId} itemId={itemId} setItemId={setItemId}
                pointsDisabled={pointsDisabled} isEgo={isEgo} handleConfirm={handleConfirm} />
        }

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Current Draft</span>
        {clashBattle.mode === "standard" ?
            <ParticipantGrid participants={clashBattle.participants}>
                {x => {
                    return <div key={x.player_id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ wordWrap: "break-word", overflowWrap: "break-word", textAlign: "center" }}>
                            {x.display_name}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", width: "128px" }}>
                            {x.identities.map(id => <IdentityIcon key={id} id={id} displayName={true} displayRarity={true} />)}
                        </div>
                        {x.ego &&
                            <EgoIcon key={x.ego} id={x.ego} type="awaken" displayName={true} displayRarity={true} />
                        }
                    </div>
                }}
            </ParticipantGrid> : <>
                <div style={{ display: "flex", padding: "0.5rem" }}>
                    {clashBattle.getPlayerIdentities().map(id =>
                        <IdentityIcon key={id} id={id} displayName={true} displayRarity={true} size={128} />
                    )}
                    {playerEgo &&
                        <EgoIcon key={playerEgo} id={playerEgo} type="awaken" displayName={true} displayRarity={true} size={128} />
                    }
                </div>
                <ParticipantTextGrid participants={clashBattle.participants}>
                    {x => {
                        return <div key={x.player_id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                            <span
                                style={{ wordWrap: "break-word", overflowWrap: "break-word", textAlign: "center" }}
                                {...getClashArenaDraftTooltipProps([...x.identities, x.ego])}
                            >
                                {x.display_name}
                            </span>
                        </div>
                    }}
                </ParticipantTextGrid>
            </>
        }

        {clashBattle.blacklist.length > 0 && <>
            <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Bans</span>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {clashBattle.blacklist.map(id => <IdentityIcon key={id} id={id} displayName={true} displayRarity={true} size={128} />)}
            </div>
        </>}

        {!pointsDisabled && <PointsDisplay clashBattle={clashBattle} />}
    </div >
}
