import { useCallback, useMemo, useState } from "react";

import ParticipantGrid from "./ParticipantsDisplay";
import PointsDisplay from "./PointsDisplay";
import EgoIcon from "../components/icons/EgoIcon";
import Icon from "../components/icons/Icon";
import IdentityIcon from "../components/icons/IdentityIcon"
import SkillIcon from "../components/icons/SkillIcon";
import MarkdownRenderer from "../components/markdown/MarkdownRenderer";
import NamePill from "../components/objects/NamePill";
import { EgoDropdownSelector } from "../components/selectors/EgoSelectors";
import { IdentityDropdownSelector } from "../components/selectors/IdentitySelectors"
import { getClashArenaSkillTooltipProps } from "../components/tooltips/ClashArenaSkillTooltip";
import { selectStyleVariable } from "../styles/selectStyle"

export default function DraftScreen({ clashBattle }) {
    const [itemId, setItemId] = useState(null);

    const [isEgo, draftId] = useMemo(() => {
        const id = clashBattle.draftOrder[0];
        const isEgo = typeof id === "string" && id.startsWith("e-");
        const draftId = isEgo ? Number(id.slice(2)) : id;
        return [isEgo, draftId]
    }, [clashBattle.draftOrder])

    const handleConfirm = useCallback(() => {
        clashBattle.pickItem(itemId);
        setItemId(null);
    }, [clashBattle, itemId]);

    const pointsDisabled = clashBattle.settings["pointsPerDraft"] === 0;

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Clash Arena</h1>

        <span className="sub-text" style={{ maxWidth: "1000px", textAlign: "center", marginBottom: "1rem" }}>
            Note: Some skills and conditionals have been simplified or modified to better fit the mechanics and limitations of Clash Arena. Certain mechanics like resonance or deploying specific identities have been omitted entirely. Hover over a skill to see the conditionals currently implemented for it.
        </span>

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Next Drafts</span>
        <div style={{ display: "flex", gap: "1rem" }}>
            {clashBattle.draftOrder.map((id, i) => {
                const playerId = typeof id === "string" && id.startsWith("e-") ? Number(id.slice(2)) : id;

                return <span key={`${id}-${i}`}>
                    {i === 0 ? "▶" : ""} {clashBattle.participants.find(x => x.player_id === playerId).display_name}
                </span>
            })}
        </div>

        {
            draftId === clashBattle.playerId ?
                <>
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
                                    excludeOptions={clashBattle.getSelectedEgo()}
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
                                            .filter(([, data]) => data.type === "id")
                                            .map(([id]) => id)
                                    }
                                    excludeOptions={clashBattle.getSelectedIdentities()}
                                    autoFocus={true}
                                    nameAppendFunc={identity =>
                                        pointsDisabled ? null :
                                            ` (${clashBattle.clashingData[identity.id].points} points)`
                                    }
                                />
                        }
                    </div>
                    {!isEgo && itemId && <>
                        {clashBattle.clashingData[itemId].modifierDesc &&
                            <MarkdownRenderer content={clashBattle.clashingData[itemId].modifierDesc} />
                        }
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                            {
                                [1, 2, 3].map(skill => {
                                    const skillData = clashBattle.clashingData[itemId][String(skill)]

                                    return <div key={skill}
                                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}
                                        {...getClashArenaSkillTooltipProps(itemId, skill, null)}
                                    >
                                        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                                            <SkillIcon skillData={skillData} />
                                            <span style={{ color: "var(--secondary-text-color", fontSize: "2rem", fontWeight: "bold" }}>x{4 - skill}</span>
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
                    {isEgo && itemId && <>
                        {clashBattle.clashingData[itemId].modifierDesc &&
                            <MarkdownRenderer content={clashBattle.clashingData[itemId].modifierDesc} />
                        }
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
                            {
                                ["a", "c"].map(skill => {
                                    const skillData = clashBattle.clashingData[itemId][String(skill)]
                                    if(!skillData) return null;

                                    return <div key={skill}
                                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}
                                        {...getClashArenaSkillTooltipProps(itemId, skill, null)}
                                    >
                                        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                                            <SkillIcon skillData={skillData} />
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
                </> :
                <span>
                    {clashBattle.participants.find(x => x.player_id === draftId).display_name} is choosing...
                </span>
        }

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Current Draft</span>
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
        </ParticipantGrid>

        {!pointsDisabled && <PointsDisplay clashBattle={clashBattle} />}
    </div >
}
