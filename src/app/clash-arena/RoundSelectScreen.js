import React, { useCallback, useState } from "react";

import styles from "./clashArena.module.css";
import ParticipantGrid from "./ParticipantsDisplay";
import ScenarioDisplay from "./ScenarioDisplay";
import { calculateSkillRange } from "./util";
import Icon from "../components/icons/Icon";
import IdentityIcon from "../components/icons/IdentityIcon"
import SkillIcon from "../components/icons/SkillIcon";
import NamePill from "../components/objects/NamePill";
import { getClashArenaSkillTooltipProps } from "../components/tooltips/ClashArenaSkillTooltip";

export default function RoundSelectScreen({ clashBattle }) {
    const [identityId, setIdentityId] = useState(null);
    const [skill, setSkill] = useState(null);

    const [skillData, skillRange] = useMemo(() => {
        if (!identityId || !skill) return [null, null];
        const skillData = clashBattle.clashingData[identityId][String(skill)]
        const range = calculateSkillRange(skillData, clashBattle.round.self, clashBattle.round.target);
        return [skillData, range];
    }, [identityId, skill, clashBattle]);

    const handleConfirm = useCallback(() => {
        clashBattle.selectSkill(identityId, skill);
    }, [clashBattle, identityId, skill]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Clash Arena</h1>

        <span>Round: {clashBattle.roundNumber}/{clashBattle.settings.rounds}</span>

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Current Scenario</span>
        <ScenarioDisplay round={clashBattle.round} />

        {skillData && skillRange && <>
            <span>
                Chosen Skill:
            </span>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <SkillIcon skillData={skillData} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <NamePill name={skillData.name} affinity={skillData.affinity} />
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                            {skillRange.min} - {skillRange.max}
                        </span>
                        <div style={{ width: "0.5rem" }} />
                        {Array.from({ length: skillData.coins }, (v, i) =>
                            <Icon style={{ width: "24px", height: "24px" }} key={i} path={"coin"} />
                        )}
                    </div>
                </div>
            </div>
            {clashBattle.skillConfirmed ?
                <span>
                    Waiting for everyone to choose their skills: {clashBattle.chosenCount}/{clashBattle.participants.length}
                </span> :
                <span className="text-link" onClick={handleConfirm}
                    style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
                >
                    Confirm choice
                </span>
            }
        </>}

        <span>Choose a skill to use:</span>
        <div style={{ display: "grid", gridTemplateColumns: "128px auto", gap: "0.5rem", alignItems: "center" }}>
            {Object.entries(clashBattle.skillCounts).map(([id, counts]) => <React.Fragment key={id}>
                <IdentityIcon id={id} displayName={true} displayRarity={true} />
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {
                        [1, 2, 3].map(skill => {
                            const skillData = clashBattle.clashingData[id][String(skill)]
                            const range = calculateSkillRange(skillData, clashBattle.round.self, clashBattle.round.target);
                            return <div key={skill} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
                                <div
                                    className={`${styles.skillOption} ${counts[skill - 1] <= 0 ? styles.disabled : null}`}
                                    {...getClashArenaSkillTooltipProps(id, skill, clashBattle.round)}
                                    onClick={() => {
                                        if (counts[skill - 1] === 0) return;
                                        setIdentityId(id);
                                        setSkill(String(skill));
                                    }}
                                >
                                    <SkillIcon skillData={skillData} />
                                    <span style={{ color: "var(--secondary-text-color", fontSize: "2rem", fontWeight: "bold" }}>
                                        x{counts[skill - 1]}
                                    </span>
                                </div>
                                <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                                    {range.min} - {range.max}
                                </span>
                            </div>
                        })
                    }
                </div>
            </React.Fragment>)}
        </div>

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Players</span>
        <ParticipantGrid participants={clashBattle.participants}>
            {x => {
                return <div key={x.player_id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ wordWrap: "break-word", overflowWrap: "break-word", textAlign: "center" }}>
                        {x.display_name}
                    </span>
                    <span style={{ textAlign: "center" }}>
                        Score: {x.score}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", width: "128px" }}>
                        {x.identities.map(id => <IdentityIcon key={id} id={id} displayName={true} displayRarity={true} />)}
                    </div>
                </div>
            }}
        </ParticipantGrid>
    </div >
}
