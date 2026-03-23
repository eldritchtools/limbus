import { useMemo } from "react";

import PassiveCard from "./PassiveCard";
import SkillCard from "./SkillCard";
import { useSkillData } from "../dataHooks/skills";
import AutoScroller from "../objects/AutoScroller";

import { egoRanks, LEVEL_CAP } from "@/app/lib/constants";
import { constructSkillLabel } from "@/app/lib/skill";

function IdentitySkillSummary({ identity, type, uptie = 4, level = LEVEL_CAP }) {
    const { skills, combatPassives, supportPassives } = useSkillData("identity", identity.id, uptie);

    const cards = [];

    if (type === "s1" || type === "skills") {
        identity.skillTypes.filter(skill => skill.type.tier === 1).forEach((skill, i) =>
            cards.push(<SkillCard key={skill.id} skill={skills[skill.id].data} mini={true} count={skill.num} level={level} label={constructSkillLabel("attack", 1, i)} />)
        );
    }
    if (type === "s2" || type === "skills") {
        identity.skillTypes.filter(skill => skill.type.tier === 2).forEach((skill, i) =>
            cards.push(<SkillCard key={skill.id} skill={skills[skill.id].data} mini={true} count={skill.num} level={level} label={constructSkillLabel("attack", 2, i)} />)
        );
    }
    if (type === "s3" || type === "skills") {
        identity.skillTypes.filter(skill => skill.type.tier === 3).forEach((skill, i) =>
            cards.push(<SkillCard key={skill.id} skill={skills[skill.id].data} mini={true} count={skill.num} level={level} label={constructSkillLabel("attack", 3, i)} />)
        );
    }
    if (type === "skills") {
        identity.skillTypes.filter(skill => skill.type.tier === 4).forEach((skill, i) =>
            cards.push(<SkillCard key={skill.id} skill={skills[skill.id].data} mini={true} count={skill.num} level={level} label={constructSkillLabel("attack", 4, i)} />)
        );
    }
    if (type === "def" || type === "skills") {
        identity.defenseSkillTypes.forEach((skill, i) =>
            cards.push(<SkillCard key={skill.id} skill={skills[skill.id].data} mini={true} count={skill.num} level={level} label={constructSkillLabel("defense")} />)
        );
    }
    if (type === "passives1") {
        combatPassives.forEach((p, i) =>
            cards.push(<PassiveCard key={`passive-${i}`} passive={p} mini={true} />)
        )
    }
    if (type === "passives2") {
        supportPassives.forEach((p, i) =>
            cards.push(<PassiveCard key={`passive-${i}`} passive={p} mini={true} />)
        )
    }

    if (cards.length === 0) return null;

    return <AutoScroller>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.1rem" }}>
            {cards}
        </div>
    </AutoScroller>
}

function EgoSkillSummary({ egos, type, threadspins, num }) {
    const chosen = useMemo(() => (num !== undefined) ?
        ([[egos[num], threadspins?.[num] ?? 4, num]]) :
        egos.map((ego, i) => [ego, threadspins?.[i] ?? 4, i]).filter(([ego]) => ego),
        [egos, threadspins, num]);

    const skillData = useSkillData("ego", chosen.map(([ego]) => ego.id), chosen.map(([, threadspin]) => threadspin));

    const cards = [];
    if (type === "ego") {
        const [ego] = chosen[0];
        skillData[ego.id].awakeningSkills.forEach(skill =>
            cards.push(<SkillCard key={skill.id} skill={skill.data} mini={true} label={constructSkillLabel("awakening")} />)
        )
        skillData[ego.id].corrosionSkills.forEach(skill =>
            cards.push(<SkillCard key={skill.id} skill={skill.data} mini={true} label={constructSkillLabel("corrosion")} />)
        )
        skillData[ego.id].passives.forEach((p, i) =>
            cards.push(<PassiveCard key={`passive-${i}`} passive={p} mini={true} label={"Passive"} />)
        )
    } else if (type === "egoa") {
        chosen.forEach(([ego, ts, rank]) => skillData[ego.id].awakeningSkills.forEach(skill =>
            cards.push(<SkillCard key={skill.id} skill={skill.data} mini={true} label={constructSkillLabel(egoRanks[rank])} />)
        ))
    } else if (type === "egob") {
        chosen.forEach(([ego, ts, rank]) => skillData[ego.id].corrosionSkills.forEach(skill =>
            cards.push(<SkillCard key={skill.id} skill={skill.data} mini={true} label={constructSkillLabel(egoRanks[rank])} />)
        ))
    } else if (type === "egopassives") {
        chosen.forEach(([ego, ts, rank]) => skillData[ego.id].passives.forEach(p =>
            cards.push(<PassiveCard key={`passive-${rank}`} passive={p} mini={true} label={constructSkillLabel(egoRanks[rank])} />)
        ))
    }

    if (cards.length === 0) return null;

    return <AutoScroller>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.1rem" }}>
            {cards}
        </div>
    </AutoScroller>
}

export { IdentitySkillSummary, EgoSkillSummary };
