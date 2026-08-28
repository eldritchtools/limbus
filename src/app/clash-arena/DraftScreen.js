import { useCallback, useState } from "react";

import ParticipantGrid from "./ParticipantsDisplay";
import Icon from "../components/icons/Icon";
import IdentityIcon from "../components/icons/IdentityIcon"
import SkillIcon from "../components/icons/SkillIcon";
import NamePill from "../components/objects/NamePill";
import { IdentityDropdownSelector } from "../components/selectors/IdentitySelectors"
import { getClashArenaSkillTooltipProps } from "../components/tooltips/ClashArenaSkillTooltip";
import { selectStyleVariable } from "../styles/selectStyle"

export default function DraftScreen({ clashBattle }) {
    const [identityId, setIdentityId] = useState(null);

    const handleConfirm = useCallback(() => {
        clashBattle.pickIdentity(identityId);
        setIdentityId(null);
    }, [clashBattle, identityId]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Clash Arena</h1>

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Next Drafts</span>
        <div style={{ display: "flex", gap: "1rem" }}>
            {clashBattle.draftOrder.map((id, i) =>
                <span key={`${id}-${i}`}>
                    {i === 0 ? "▶" : ""} {clashBattle.participants.find(x => x.player_id === id).display_name}
                </span>
            )}
        </div>

        {
            clashBattle.draftOrder[0] === clashBattle.playerId ?
                <>
                    <span>Choose an identity:</span>
                    <div style={{ width: "min(100%, 1000px)" }}>
                        <IdentityDropdownSelector
                            selected={identityId} setSelected={x => setIdentityId(x)} styles={selectStyleVariable}
                            options={Object.keys(clashBattle.clashingData)}
                            excludeOptions={clashBattle.getSelectedIdentities()}
                            autoFocus={true}
                        />
                    </div>
                    {identityId &&
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                            {
                                [1, 2, 3].map(skill => {
                                    const skillData = clashBattle.clashingData[identityId][String(skill)]

                                    return <div key={skill}
                                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}
                                        {...getClashArenaSkillTooltipProps(identityId, skill, null)}
                                    >
                                        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                                            <SkillIcon skillData={skillData} />
                                            <span style={{ color: "var(--secondary-text-color", fontSize: "2rem", fontWeight: "bold" }}>x{4 - skill}</span>
                                        </div>
                                        <div style={{ maxWidth: "200px", margin: "0 1.5rem", alignSelf: "start" }}>
                                            <NamePill name={skillData.name} affinity={skillData.affinity} />
                                        </div>
                                        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                                            <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                                                {skillData.base} {skillData.coin > 0 ? "+" : ""}{skillData.coin}
                                            </span>
                                            {Array.from({ length: skillData.coins }, (v, i) =>
                                                <Icon style={{ width: "24px", height: "24px" }} key={i} path={"coin"} />
                                            )}
                                        </div>
                                    </div>
                                })
                            }
                        </div>
                    }
                    {identityId && <>
                        <span className="text-link" onClick={handleConfirm}
                            style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
                        >
                            Confirm choice
                        </span>
                    </>
                    }
                </> :
                <span>
                    {clashBattle.participants.find(x => x.player_id === clashBattle.draftOrder[0]).display_name} is choosing...
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
                </div>
            }}
        </ParticipantGrid>
    </div >
}
