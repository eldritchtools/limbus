import { useMemo, useState } from "react";

import { StatTable } from "./components";
import { MAX_DEPARTMENT_AGENTS, MAX_DEPARTMENT_SUBJECTS } from "./constants";
import { getAgentEffectiveStats } from "./gear";
import { SubjectSprite } from "./icons";
import styles from "./idleSim.module.css";

function DepartmentScreen({ idleSim }) {
    const department = idleSim.state.departments[idleSim.uiState.department];
    const [subjectIndex, setSubjectIndex] = useState(0);
    const [agentIndex, setAgentIndex] = useState(0);

    const subject = idleSim.data.subjects[department.subject_ids[subjectIndex]];

    const [agent, agentStats] = useMemo(() => {
        const agent = idleSim.state.agents[department.agent_ids[agentIndex]];
        return [agent, agent ? getAgentEffectiveStats(idleSim.data, idleSim.state, agent) : null];
    }, [idleSim, department, agentIndex]);

    return <>
        <button onClick={() => idleSim.updateUiState({ department: null })}>Go Back</button>
        <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{department.label}</span>
        <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid var(--primary-border-color)", borderRadius: "0.5rem", padding: "0.5rem", boxSizing: "border-box" }}>
                {agent ? <>
                    <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{agent.name}</span>
                    <StatTable data={agentStats} />
                </> :
                    <span>No agents</span>
                }
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid var(--primary-border-color)", borderRadius: "0.5rem", padding: "0.5rem", boxSizing: "border-box" }}>
                {subject ? <>
                    <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{subject.name}</span>
                    <SubjectSprite width={128} height={128} src={subject.src} />
                    <StatTable data={subject} />
                </> :
                    <span>No subjects</span>
                }
            </div>
        </div>
    </>
}

function ListScreen({ idleSim }) {
    const [freeAgents, freeSubjects] = useMemo(() => {
        const assignedAgents = new Set();
        const assignedSubjects = new Set();

        idleSim.state.departments.forEach(dept => {
            dept.agent_ids.forEach(id => assignedAgents.add(id));
            dept.subject_ids.forEach(id => assignedSubjects.add(id));
        });

        idleSim.state.expeditions.forEach(exp => exp.agent_ids.forEach(id => assignedAgents.add(id)));
        idleSim.state.pending_events.forEach(ev => ev.agent_ids.forEach(id => assignedAgents.add(id)));

        return [
            Object.keys(idleSim.state.agents).filter(({ id }) => !assignedAgents.has(id)),
            Object.keys(idleSim.state.subjects).filter(id => !assignedSubjects.has(id))
        ]
    },
        [idleSim.state]
    );

    return <>
        {idleSim.state.departments.map((department, i) => {
            return <div key={i} className={styles.tile} style={{ gap: "0.5rem" }} onClick={() => idleSim.updateUiState({ department: i })}>
                <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{department.label}</span>
                <div style={{ display: "flex", gap: "0.2rem" }}>
                    {department.subject_ids.map(subjectId =>
                        <div key={subjectId} className={styles.clickableTile} style={{ width: "100px", height: "100px", justifyContent: "center" }}>
                            <SubjectSprite width={96} height={96} src={idleSim.data.subjects[subjectId].src} />
                        </div>
                    )}
                    {department.subject_ids.length < MAX_DEPARTMENT_SUBJECTS &&
                        <div className={styles.clickableTile} style={{ width: "100px", height: "100px", justifyContent: "center" }}>
                            + Subject
                        </div>
                    }
                </div>
                <div style={{ display: "flex", gap: "0.2rem" }}>
                    {department.agent_ids.map(agentId => <div key={agentId}>
                        {idleSim.data.agents[agentId].name}
                    </div>)}
                    {department.agent_ids.length < MAX_DEPARTMENT_AGENTS &&
                        <button>+ Agent</button>
                    }
                </div>
            </div>
        })}
    </>
}

export default function FacilityTab({ idleSim }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        {idleSim.uiState.department || idleSim.uiState.department === 0 ?
            <DepartmentScreen idleSim={idleSim} /> :
            <ListScreen idleSim={idleSim} />
        }
    </div>;
}