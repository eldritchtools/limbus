import { useMemo, useState } from "react";

import { useSkillData } from "../components/dataHooks/skills";
import { useData } from "../components/DataProvider";
import Icon from "../components/icons/Icon";
import IdentityIcon from "../components/icons/IdentityIcon";
import KeywordIcon from "../components/icons/KeywordIcon";
import RarityIcon from "../components/icons/RarityIcon";
import { IdentityDropdownSelector } from "../components/selectors/IdentitySelectors";
import UptieSelector from "../components/selectors/UptieSelector";
import PassiveCard from "../components/skill/PassiveCard";
import SkillCard from "../components/skill/SkillCard";
import { ColoredResistance } from "../lib/colors";
import { LEVEL_CAP, sinnerIdMapping } from "../lib/constants";
import { constructDefenseLevel, constructHp, constructSpeed } from "../lib/identity";
import { constructSkillLabel } from "../lib/skill";
import { selectStyleVariable } from "../styles/selectStyle";

function ComparisonCard({ identity }) {
    const [uptie, setUptie] = useState(4);
    const { skills, combatPassives, supportPassives } = useSkillData("identity", identity.id, uptie);

    const components = useMemo(() => {
        const list = [];
        const counts = {};
        identity.skillTypes.forEach(s => {
            const skill = skills[s.id];
            if(!skill) return;
            if (skill.tier in counts) counts[skill.tier] += 1;
            else counts[skill.tier] = 0;
            list.push(<SkillCard key={s.id} skill={skill.data} mini={true} label={constructSkillLabel("attack", skill.tier, counts[skill.tier])} />)
        })

        identity.defenseSkillTypes.forEach(s => {
            const skill = skills[s.id];
            if(!skill) return;
            list.push(<SkillCard key={s.id} skill={skill.data} mini={true} label={constructSkillLabel("defense")} />)
        })

        combatPassives.forEach((p, i) =>
            list.push(<PassiveCard key={`pasa-${i}`} passive={p} mini={true} label={constructSkillLabel("combat")} />)
        )

        supportPassives.forEach((p, i) =>
            list.push(<PassiveCard key={`pasb-${i}`} passive={p} mini={true} label={constructSkillLabel("support")} />)
        )
        return list;
    }, [skills, combatPassives, supportPassives, identity]);

    return <div style={{ display: "flex", flexDirection: "column", flex: "1", minWidth: "320px", maxWidth: "480px", border: "1px #aaa solid", borderRadius: "1rem", padding: "0.5rem", gap: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <RarityIcon rarity={identity.rank} style={{ display: "inline", height: "1.5rem" }} />
            <div style={{ display: "flex", flexDirection: "column", fontSize: "1rem", fontWeight: "bold", alignItems: "center", textAlign: "center" }}>
                <span>{sinnerIdMapping[identity.sinnerId]}</span>
                <span>{identity.name}</span>
            </div>
            <UptieSelector value={uptie} setValue={setUptie} />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
            <IdentityIcon identity={identity} uptie={2} displayName={false} displayRarity={false} size={128} />
            {identity.tags.includes("Base Identity") ? null : <IdentityIcon identity={identity} uptie={4} displayName={false} displayRarity={false} size={128} />}
        </div>
        <div style={{ border: "1px #aaa solid", width: "100%" }} />
        <div style={{ display: "flex", flexDirection: "column", width: "auto", height: "auto", justifyContent: "center", gap: "0.2rem", alignItems: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr 2fr" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem", textAlign: "center" }}>
                    <Icon path={"hp"} style={{ width: "32px", height: "32px" }} />
                    {constructHp(identity, LEVEL_CAP)}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem", textAlign: "center" }}>
                    <Icon path={"speed"} style={{ width: "32px", height: "32px" }} />
                    {constructSpeed(identity, 4)}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem", textAlign: "center" }}>
                    <Icon path={"defense level"} style={{ width: "32px", height: "32px" }} />
                    {constructDefenseLevel(identity, LEVEL_CAP)}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                    <KeywordIcon id={"Slash"} />
                    <ColoredResistance resist={identity.resists.slash} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                    <KeywordIcon id={"Pierce"} />
                    <ColoredResistance resist={identity.resists.pierce} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                    <KeywordIcon id={"Blunt"} />
                    <ColoredResistance resist={identity.resists.blunt} />
                </div>
            </div>

            <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                {(identity.skillKeywordList || []).map(x => <KeywordIcon key={x} id={x} />)}
            </div>
        </div>
        <div style={{ border: "1px #aaa solid", width: "100%" }} />
        <div style={{ display: "flex", flexDirection: "column", "gap": "0.2rem", width: "100%" }}>
            {components}
        </div>
    </div>
}

export default function IdentityComparisonBasic({ }) {
    const [selected, setSelected] = useState([]);
    const [identities, identitiesLoading] = useData(`identities`);

    if (identitiesLoading)
        return <div style={{ display: "flex", flexDirection: "column" }}>
            <h2>Loading data...</h2>
        </div>;

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.9rem", wordWrap: "wrap" }}>
            Select two or more identities to compare their stats and skills.
        </span>
        <div style={{ minWidth: "20rem", maxWidth: "min(100rem, 90%)" }}>
            <IdentityDropdownSelector selected={selected} setSelected={setSelected} isMulti={true} styles={selectStyleVariable} />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {selected.map(id =>
                <ComparisonCard key={id} identity={identities[id]} />
            )}
        </div>
    </div>

}
