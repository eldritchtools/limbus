import { useState } from "react";

import { useSkillData } from "../components/dataHooks/skills";
import { useData } from "../components/DataProvider";
import EgoIcon from "../components/icons/EgoIcon";
import KeywordIcon from "../components/icons/KeywordIcon";
import RarityIcon from "../components/icons/RarityIcon";
import { EgoDropdownSelector } from "../components/selectors/EgoSelectors";
import UptieSelector from "../components/selectors/UptieSelector";
import PassiveCard from "../components/skill/PassiveCard";
import SkillCard from "../components/skill/SkillCard";
import { ColoredResistance } from "../lib/colors";
import { affinities, sinnerIdMapping } from "../lib/constants";
import { constructSkillLabel } from "../lib/skill";
import { selectStyleVariable } from "../styles/selectStyle";

function ComparisonCard({ ego }) {
    const [uptie, setUptie] = useState(4);
    const { awakeningSkills, corrosionSkills, passives } = useSkillData("ego", ego.id, uptie);

    const components = useMemo(() => {
        const list = [];
        awakeningSkills.forEach((s, i) =>
            list.push(<SkillCard key={`awa-${i}`} skill={s.data} mini={true} label={constructSkillLabel("awakening")} />)
        );
        corrosionSkills.forEach((s, i) =>
            list.push(<SkillCard key={`cor-${i}`} skill={s.data} mini={true} label={constructSkillLabel("corrosion")} />)
        );
        passives.forEach((p, i) =>
            list.push(<PassiveCard key={`pas-${i}`} passive={p} mini={true} label={constructSkillLabel("passive")} />)
        );
        return list;
    }, [awakeningSkills, corrosionSkills, passives]);

    return <div style={{ display: "flex", flexDirection: "column", flex: "1", minWidth: "320px", maxWidth: "480px", border: "1px #aaa solid", borderRadius: "1rem", padding: "0.5rem", gap: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%" }}>
            <RarityIcon rarity={ego.rank.toLowerCase()} style={{ display: "inline", height: "2rem" }} />
            <div style={{ display: "flex", flexDirection: "column", fontSize: "1.2rem", fontWeight: "bold", alignItems: "center", textAlign: "center" }}>
                <span>{sinnerIdMapping[ego.sinnerId]}</span>
                <span>{ego.name}</span>
            </div>
            <UptieSelector value={uptie} setValue={setUptie} />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
            <EgoIcon ego={ego} type={"awaken"} displayName={false} displayRarity={false} size={128} />
            {"corrosionType" in ego ? <EgoIcon ego={ego} type={"erosion"} displayName={false} displayRarity={false} size={128} /> : null}
        </div>
        <div style={{ border: "1px #aaa solid", width: "100%" }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, max-content)", gap: "0.2rem", justifyItems: "center", alignSelf: "center" }}>
            {affinities.map(affinity => <KeywordIcon key={affinity} id={affinity} />)}
            {affinities.map(affinity => <span key={`${affinity}-c`}>{affinity in ego.cost ? `x${ego.cost[affinity]}` : <span style={{ color: "#777" }}>x0</span>}</span>)}
            {affinities.map(affinity => <span key={`${affinity}-r`}>{<ColoredResistance resist={ego.resists[affinity]} />}</span>)}
        </div>
        <div style={{ border: "1px #aaa solid", width: "100%" }} />
        <div style={{ display: "flex", flexDirection: "column", "gap": "0.2rem", width: "100%" }}>
            {components}
        </div>
    </div>
}

export default function EgoComparisonBasic({ }) {
    const [selected, setSelected] = useState([]);
    const [egos, egosLoading] = useData(`egos`);

    if (egosLoading)
        return <div style={{ display: "flex", flexDirection: "column" }}>
            <h2>Loading data...</h2>
        </div>;

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.9rem", wordWrap: "wrap" }}>
            Select two or more E.G.Os to compare their stats and skills.
        </span>
        <div style={{ minWidth: "20rem", maxWidth: "min(100rem, 90%)" }}>
            <EgoDropdownSelector selected={selected} setSelected={setSelected} isMulti={true} styles={selectStyleVariable} />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {selected.map(id =>
                <ComparisonCard key={id} ego={egos[id]} />
            )}
        </div>
    </div>
}
