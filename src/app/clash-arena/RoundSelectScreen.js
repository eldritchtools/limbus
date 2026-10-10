import React, { useCallback, useMemo, useState } from "react";

import styles from "./clashArena.module.css";
import { resolveSkills } from "./modifiers";
import ParticipantGrid from "./ParticipantsDisplay";
import ScenarioDisplay from "./ScenarioDisplay";
import StatusDisplay from "./StatusDisplay";
import { calculateSkillRange } from "./util";
import EgoIcon from "../components/icons/EgoIcon";
import Icon from "../components/icons/Icon";
import IdentityIcon from "../components/icons/IdentityIcon"
import SkillIcon from "../components/icons/SkillIcon";
import NamePill from "../components/objects/NamePill";
import { getClashArenaSkillTooltipProps } from "../components/tooltips/ClashArenaSkillTooltip";
import { getGeneralMarkdownTooltipProps } from "../components/tooltips/GeneralMarkdownTooltip";

export default function RoundSelectScreen({ clashBattle }) {
    const [itemId, setItemId] = useState(null);
    const [skillSlot, setSkillSlot] = useState(null);
    const [skill, setSkill] = useState(null);

    const [skillData, skillRange] = useMemo(() => {
        if (!itemId || !skill) return [null, null];
        const skillData = clashBattle.clashingData[itemId][String(skill)]
        const range = calculateSkillRange(skillData, clashBattle.round, clashBattle.clashingData[itemId].statuses ?? []);
        return [skillData, range];
    }, [itemId, skill, clashBattle]);

    const handleConfirm = useCallback(() => {
        clashBattle.selectSkill(itemId, skillSlot);
    }, [clashBattle, itemId, skillSlot]);

    const teamBonusMatches = useMemo(() => {
        const ids = Object.keys(clashBattle.skillCounts);

        return ids.reduce((acc, id) => {
            acc[id] = {
                faction: ids.filter(x => x !== id && (clashBattle.clashingData[id].factions ?? []).some(y => (clashBattle.clashingData[x].factions ?? []).includes(y))).length,
                keyword: ids.filter(x => x !== id && (clashBattle.clashingData[id].keywords ?? []).some(y => (clashBattle.clashingData[x].keywords ?? []).includes(y))).length,
            };
            return acc;
        }, {})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const teamBonuses = useMemo(() =>
        Object.entries(teamBonusMatches).reduce((acc, [id, matches]) => {
            const f = matches.faction * clashBattle.round.faction_bonus;
            const k = matches.keyword * clashBattle.round.keyword_bonus
            acc[id] = { faction: f, keyword: k, total: f + k };
            return acc;
        }, {}),
        [teamBonusMatches, clashBattle.round]);

    const playerEgo = clashBattle.getPlayerEgo();

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
                            {skillRange.min + (teamBonuses[itemId]?.total ?? 0)} - {skillRange.max + (teamBonuses[itemId]?.total ?? 0)}
                        </span>
                        <div style={{ width: "0.5rem" }} />
                        {Array.from({ length: skillData.coins }, (v, i) =>
                            <Icon style={{ width: "24px", height: "24px" }} key={i} path={"coin"} />
                        )}
                    </div>
                </div>
            </div>
            {!clashBattle.picked &&
                <span className="text-link" onClick={handleConfirm}
                    style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
                >
                    Confirm choice
                </span>
            }
        </>}

        {clashBattle.picked &&
            <span>
                Waiting for everyone to choose their skills: {clashBattle.chosenCount}/{clashBattle.participants.length}
            </span>
        }

        <span>Choose a skill to use:</span>
        <div style={{ display: "grid", gridTemplateColumns: "128px auto", gap: "0.5rem", alignItems: "center" }}>
            {Object.entries(clashBattle.skillCounts).map(([id, counts]) => <React.Fragment key={id}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div {...(clashBattle.clashingData[id].modifierDesc ? getGeneralMarkdownTooltipProps(clashBattle.clashingData[id].modifierDesc) : {})}>
                        <IdentityIcon id={id} displayName={true} displayRarity={true} size={128} />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                        {
                            (clashBattle.clashingData[id].statuses ?? [])
                                .map(({ id, values }) => [id, values[clashBattle.round.unique_statuses_tier]])
                                .filter(([, value]) => value > 0)
                                .map(([id, value]) =>
                                    <StatusDisplay key={id} id={id} potency={value} />
                                )
                        }
                    </div>
                    {teamBonuses[id].faction > 0 && <span className="sub-text">Faction Bonus: +{teamBonuses[id].faction}</span>}
                    {teamBonuses[id].keyword > 0 && <span className="sub-text">Keyword Bonus: +{teamBonuses[id].keyword}</span>}
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {
                        resolveSkills(clashBattle.clashingData[id], [1, 2, 3, 4], clashBattle.round)
                            .map((skill, index) => {
                                if (index === 3 && counts[index] === 0) return;
                                const skillData = clashBattle.clashingData[id][String(skill)];
                                const range = calculateSkillRange(skillData, clashBattle.round, clashBattle?.clashingData[id]?.statuses ?? []);
                                return <div key={skill} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
                                    <div
                                        className={`${styles.skillOption} ${counts[index] <= 0 ? styles.disabled : null}`}
                                        {...getClashArenaSkillTooltipProps(id, skill, clashBattle.round)}
                                        onClick={() => {
                                            if (counts[index] === 0 || clashBattle.picked) return;
                                            setItemId(id);
                                            setSkill(String(skill));
                                            setSkillSlot(index + 1);
                                        }}
                                    >
                                        <SkillIcon skillData={skillData} />
                                        <span style={{ color: "var(--secondary-text-color", fontSize: "2rem", fontWeight: "bold" }}>
                                            x{counts[index]}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                                        {range.min + teamBonuses[id].total} - {range.max + teamBonuses[id].total}
                                    </span>
                                </div>
                            })
                    }
                </div>
            </React.Fragment>)}
            {
                playerEgo && <>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div {...(clashBattle.clashingData[playerEgo].modifierDesc ? getGeneralMarkdownTooltipProps(clashBattle.clashingData[playerEgo].modifierDesc) : {})}>
                            <EgoIcon id={playerEgo} type="awaken" displayName={true} displayRarity={true} size={128} />
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                            {
                                (clashBattle.clashingData[playerEgo].statuses ?? [])
                                    .map(({ id, values }) => [id, values[clashBattle.round.unique_statuses_tier]])
                                    .filter(([, value]) => value > 0)
                                    .map(([id, value]) =>
                                        <StatusDisplay key={id} id={id} potency={value} />
                                    )
                            }
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "2rem", alignItems: "center", justifyContent: "center" }}>
                        {
                            resolveSkills(clashBattle.clashingData[playerEgo], ["a", "c"], clashBattle.round)
                                .map(skill => {
                                    const skillData = clashBattle.clashingData[playerEgo][skill];
                                    if (!skillData) return;
                                    const range = calculateSkillRange(skillData, clashBattle.round, clashBattle?.clashingData[playerEgo]?.statuses ?? []);
                                    return <div key={skill} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
                                        <div
                                            className={`${styles.skillOption} ${clashBattle.egoUsed ? styles.disabled : null}`}
                                            {...getClashArenaSkillTooltipProps(playerEgo, skill, clashBattle.round)}
                                            onClick={() => {
                                                if (clashBattle.egoUsed || clashBattle.picked) return;
                                                setItemId(playerEgo);
                                                setSkill(skill);
                                                setSkillSlot(skill);
                                            }}
                                        >
                                            <SkillIcon skillData={skillData} />
                                        </div>
                                        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                                            {range.min} - {range.max}
                                        </span>
                                    </div>
                                })
                        }
                    </div>
                </>
            }
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
                    {x.ego &&
                        <EgoIcon key={x.ego} id={x.ego} type="awaken" displayName={true} displayRarity={true} />
                    }
                </div>
            }}
        </ParticipantGrid>
    </div >
}
