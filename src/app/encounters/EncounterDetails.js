import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useState } from "react";

import styles from "./EncounterDetails.module.css";
import { useData } from "../components/DataProvider";
import EnemyIcon from "../components/icons/EnemyIcon";
import KeywordIcon from "../components/icons/KeywordIcon";
import StatusIcon from "../components/icons/StatusIcon";
import PassiveCard from "../components/skill/PassiveCard";
import SkillCard from "../components/skill/SkillCard";
import { ColoredResistance } from "../lib/colors";
import { affinities } from "../lib/constants";

function TargetComponent({ target }) {
    const [partIndex, setPartIndex] = useState(null);
    const { isMobile } = useBreakpoint();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPartIndex(null);
    }, [target]);

    const currentPart = target.parts ? (partIndex !== null ? target.parts[partIndex] : null) : target;

    const maybeResist = key => currentPart ?
        <ColoredResistance resist={currentPart.resists[key]} /> :
        <span style={{ fontWeight: "bold", color: "#aaa" }}>??</span>

    return <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <h3 style={{ margin: 0, textAlign: "center" }}>{target.name}</h3>
            <EnemyIcon id={target.portrait} style={{ width: isMobile ? "250px" : "auto" }} />

            {target.parts ? target.parts.map((part, i) =>
                <div key={i}
                    className={`tab-header ${partIndex === i ? "active" : ""}`}
                    style={{ border: "1px #777 solid", padding: "0.25rem", borderRadius: "0.5rem" }}
                    onClick={() => setPartIndex(i)}
                >
                    {part.name}
                </div>
            ) : null}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                    <KeywordIcon id={"Slash"} />
                    {maybeResist("slash")}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                    <KeywordIcon id={"Pierce"} />
                    {maybeResist("pierce")}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                    <KeywordIcon id={"Blunt"} />
                    {maybeResist("blunt")}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, max-content)", gap: "0.25rem", justifyItems: "center", alignSelf: "center" }}>
                {affinities.map(affinity => <KeywordIcon key={affinity} id={affinity} />)}
                {affinities.map(affinity => <span key={`${affinity}-r`}>{maybeResist(affinity)}</span>)}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            {(target.skills ?? []).map((skill, i) => <SkillCard key={i} skill={skill} />)}
            {(target.passives ?? []).map((passive, i) => <PassiveCard key={i} passive={passive} />)}
        </div>
    </div>
}

function BuffComponent({id}) {
    const [statuses, statusesLoading] = useData("statuses");
    if(statusesLoading || !(id in statuses)) return null;
    
    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", border: "1px #aaa solid", borderRadius: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", fontSize: "1rem", fontWeight: "bold" }}>
            <StatusIcon status={statuses[id]} style={{ display: "inline-block", width: "1.5rem", height: "1.5rem", marginRight: "4px" }} />
            <span>{statuses[id].name}</span>
        </div>
        <div style={{ display: "inline-block", lineHeight: "1.5", textWrap: "wrap", whiteSpace: "pre-wrap", textAlign: "start" }}>
            <span>{statuses[id].desc}</span>
        </div>
    </div>;
}

export default function EncounterDetails({ data }) {
    const [phase, setPhase] = useState(0);
    const [targetIndex, setTargetIndex] = useState(0);

    const buffs = (data.phases ? data.phases[phase].buffs : data.buffs) ?? [];
    const targets = data.phases ? data.phases[phase].targets : data.targets;

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "0.5rem" }}>
        {data.phases ?
            <div style={{ display: "flex", marginBottom: "1rem", gap: "1rem" }}>
                {Array.from({ length: data.phases.length }, (_, i) =>
                    <div key={i} className={`tab-header ${phase === i ? "active" : ""}`} onClick={() => { setPhase(i); setTargetIndex(0); }}>Phase {i + 1}</div>
                )}
            </div> :
            null
        }

        {buffs.length > 0 ? <div style={{display: "flex", flexDirection: "column"}}>
            {buffs.map(id => <BuffComponent key={id} id={id} />)}
        </div> : null}


        <div style={{ overflowX: "auto", overflowY: "hidden", maxWidth: "100%" }}>
            <div style={{ display: "flex", marginBottom: "1rem", width: "max-content", gap: "1rem" }}>
                {targets.map((target, i) =>
                    <div key={i} className={`${styles.targetIconContainer} ${targetIndex === i ? styles.active : ""}`} onClick={() => setTargetIndex(i)}>
                        <EnemyIcon id={target.portrait} style={{ width: "100%", height: "100%" }} />
                    </div>
                )}
            </div>
        </div>

        <TargetComponent target={targets[targetIndex]} />
    </div>
}