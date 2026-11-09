import { PencilIcon } from "@heroicons/react/24/solid";
import React, { useMemo, useState } from "react";

import { StatTable } from "./components";
import { MAX_CYCLE_LENGTH } from "./constants";
import { getAgentEffectiveStats, getAgentGearEffectList } from "./gear";
import { EnemySprite } from "./icons";
import styles from "./idleSim.module.css";
import { AgentMenuSelector, ScheduleMenuSelector, SubjectMenuSelector } from "./selectors";
import { getOutcomeChances } from "./simulation";
import { formatSp } from "./util";
import { HorizontalDivider } from "../components/objects/Dividers";
import DropdownButton from "../components/objects/DropdownButton";
import NumberInputWithButtons from "../components/objects/NumberInputWithButtons";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { uiColors } from "../lib/colors";

function DepartmentScreen({ idleSim, freeAgents, freeSubjects, handleAssignAgent, handleAssignSubject }) {
    const [department, subjects, agents, agentStats] = useMemo(() => {
        const department = idleSim.state.departments[idleSim.uiState.department];
        const subjects = department.subject_ids.map(id => id ? { ...idleSim.data.subjects[id], ...idleSim.state.subjects[id] } : null);

        const agents = department.agent_ids.map(id => id ? idleSim.state.agents[id] : null);
        const agentStats = agents.map(agent => agent ? getAgentEffectiveStats(idleSim.data, idleSim.state, agent, false) : null);

        return [department, subjects, agents, agentStats];
    }, [idleSim.data, idleSim.state, idleSim.uiState]);

    const [editingLabel, setEditingLabel] = useState(false);
    const [label, setLabel] = useState("");
    const [sp, setSp] = useState("current");

    return <>
        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
            {editingLabel ? <>
                <input value={label} onChange={e => setLabel(e.target.value)} />
                <button onClick={() => { setEditingLabel(false); idleSim.renameDepartment(idleSim.uiState.department, label); }} style={{ padding: "2px", border: "none" }}>
                    ✔
                </button>
                <button onClick={() => { setEditingLabel(false); setLabel(""); }} style={{ padding: "2px", border: "none" }}>
                    ✘
                </button>
            </> : <>
                <DropdownButton
                    value={idleSim.uiState.department}
                    setValue={x => idleSim.updateUiState({ department: x })}
                    options={Object.fromEntries(idleSim.state.departments.map((dept, i) => [i, dept.label]))}
                    styleOverride={{ border: "none", fontWeight: "bold", fontSize: "1.2rem" }}
                />
                <button onClick={() => { setEditingLabel(true); setLabel(department.label); }} style={{ padding: "2px", border: "none" }}>
                    <PencilIcon style={{ width: "16px", height: "16px" }} />
                </button>
            </>
            }
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <div className={styles.tile} style={{ gap: "0.5rem" }}>
                {subjects.map((subject, i) => subject ?
                    <React.Fragment key={i}>
                        {i !== 0 && <HorizontalDivider />}
                        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                            <SubjectMenuSelector
                                value={subject}
                                setValue={x => handleAssignSubject(subject.id, idleSim.uiState.department, x, i)}
                                options={[subject, ...freeSubjects]}
                                styleOverride={{ border: "none", fontWeight: "bold" }}
                                textOnly={true}
                            />

                            <button style={{ border: "none" }} onClick={() => idleSim.setUiState({ tab: "subjects", subject: subject.id })}>
                                ↗
                            </button>
                            <button style={{ border: "none", color: uiColors.red }} onClick={() => idleSim.unassignSubject(subject.id)}>
                                ✕
                            </button>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                            <span>Lv. {subject.research_level}</span>
                            <span>WE Req: {subject.we_req}</span>
                            <span>SP Cost: {subject.sp_cost}</span>
                        </div>
                        <div style={{ display: "flex" }}>
                            <EnemySprite key={subject.id} width={96} height={96} src={subject.src} />
                            <StatTable data={subject} />
                        </div>
                        {subject.desc && <span style={{ maxWidth: "400px" }}>{subject.desc}</span>}
                    </React.Fragment> :
                    <React.Fragment key={i}>
                        {i !== 0 && <HorizontalDivider />}
                        <SubjectMenuSelector
                            value={null}
                            setValue={x => handleAssignSubject(null, idleSim.uiState.department, x, i)}
                            options={freeSubjects}
                            styleOverride={{ border: "none", fontWeight: "bold" }}
                            textOnly={true}
                        />
                    </React.Fragment>
                )}
            </div>

            <div className={styles.tile} style={{ gap: "0.5rem" }}>
                {agents.map((agent, i) => agent ?
                    <React.Fragment key={i}>
                        {i !== 0 && <HorizontalDivider />}
                        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                            <AgentMenuSelector
                                value={agent}
                                setValue={x => handleAssignAgent(agent.id, idleSim.uiState.department, x, i)}
                                options={[agent, ...freeAgents]}
                                styleOverride={{ border: "none", fontWeight: "bold" }}
                                textOnly={true}
                            />

                            <button style={{ border: "none" }} onClick={() => idleSim.setUiState({ tab: "agents", agent: agent.id })}>
                                ↗
                            </button>
                            <button style={{ border: "none", color: uiColors.red }} onClick={() => idleSim.unassignAgent(agent.id)}>
                                ✕
                            </button>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                            <span>Lv. {agent.level}</span>
                            <span>HP: {Math.round(agent.hp)}/{agent.max_hp}</span>
                            <span>SP: {formatSp(agent.sp)}</span>
                            <span>WE: {agentStats[i].work_efficiency}</span>
                        </div>
                        <div style={{ display: "flex" }}>
                            <StatTable data={agentStats[i]} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", maxWidth: "400px" }}>
                            {getAgentGearEffectList(idleSim.data, agent).map((x, i) => <span key={i}>{x}</span>)}
                        </div>
                    </React.Fragment> :
                    <React.Fragment key={i}>
                        {i !== 0 && <HorizontalDivider />}
                        <AgentMenuSelector
                            value={null}
                            setValue={x => handleAssignAgent(null, idleSim.uiState.department, x, i)}
                            options={freeAgents}
                            styleOverride={{ border: "none", fontWeight: "bold" }}
                            textOnly={true}
                        />
                    </React.Fragment>
                )}
            </div>
        </div>

        <span
            className="hover-text"
            style={{ fontWeight: "bold", fontSize: "1.2rem", marginTop: "0.5rem" }}
            {...getGeneralTooltipProps(`The success rate of an agent is based on their effective work efficiency vs the work efficiency requirement of the subject. The effective work efficiency of an agent is computed as their base WE plus the sum of their offense ratings multiplied by the corresponding defense ratings of the subject. SP gives an up to 25% increase or decrease in the final effective work efficiency based on its value. Special effects on gear are not taken into account for these numbers.`)}
        >
            Estimated Success Rate
        </span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            Simulated SP:
            <select value={sp} onChange={e => setSp(e.target.value)}>
                <option value={"current"}>Current SP</option>
                <option value={0}>0 SP</option>
                <option value={45}>45 SP</option>
                <option value={-45}>-45 SP</option>
            </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${subjects.filter(Boolean).length + 1}, auto)`, gap: "0.5rem", textAlign: "center" }}>
            <div />
            {subjects.filter(Boolean).map(subject => <EnemySprite key={subject.id} width={64} height={64} src={subject.src} />)}
            {agents.filter(Boolean).map(agent => <React.Fragment key={agent.id}>
                <span>{agent.name}</span>
                {subjects.filter(Boolean).map(subject => {
                    const usedAgent = sp === "current" ? agent : { ...agent, sp }
                    const chances = getOutcomeChances(idleSim.data, idleSim.state, usedAgent, subject);
                    const good = Math.round(chances.good * 100);
                    const bad = Math.min(Math.round(chances.bad * 100), 100 - good);
                    const avg = 100 - good - bad;
                    return <span key={subject.id}>
                        <span style={{ color: "#3c9d5d" }}>{good}%</span>/
                        <span style={{ color: "#d4b43a" }}>{avg}%</span>/
                        <span style={{ color: "#c0463c" }}>{bad}%</span>
                    </span>
                })}
            </React.Fragment>)}
        </div>

        <span style={{ fontWeight: "bold", fontSize: "1.2rem", marginTop: "0.5rem" }}>Schedule</span>
        <div style={{ display: "flex", gap: "0.2rem", marginBottom: "0.5rem", alignItems: "center" }}>
            Cycle Length: <NumberInputWithButtons min={1} max={MAX_CYCLE_LENGTH}
                value={department.cycle_length} setValue={x => idleSim.setCycleLength(idleSim.uiState.department, x)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `auto auto repeat(${agents.filter(Boolean).length}, 150px)`, gap: "0.2rem", overflowX: "auto", alignItems: "center", justifyItems: "center" }}>
            <div />
            <div />
            {agents.map((agent, i) => agent &&
                <span key={`name-${i}`} style={{ fontWeight: "bold" }}>{agent.name}</span>
            )}
            {
                Array.from({ length: department.cycle_length }, (_, i) => <React.Fragment key={`block-${i}`}>
                    <span>{department.cycle_block === i ? "▶" : ""}</span>
                    <span style={{ fontSize: "1.2rem", fontWeight: "bold", padding: "4px" }}>{i + 1}</span>
                    {agents.map((agent, j) => agent &&
                        <ScheduleMenuSelector key={`sch-${i}-${j}`}
                            value={department.schedule[agent.id][i]}
                            setValue={x => idleSim.setScheduleBlock(idleSim.uiState.department, agent.id, i, x)}
                            options={subjects.filter(Boolean)}
                        />
                    )}
                </React.Fragment>)
            }
        </div>
    </>
}

function ListScreen({ idleSim, freeAgents, freeSubjects, handleAssignAgent, handleAssignSubject }) {
    return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, 600px)", gap: "0.5rem", maxWidth: "100%" }}>
        {idleSim.state.departments.map((department, i) => {
            return <div key={i} className={styles.tile} style={{ gap: "0.2rem", width: "600px" }}>
                <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{department.label}</span>
                <div style={{ display: "flex", gap: "0.1rem" }}>
                    {department.subject_ids.map((subjectId, j) =>
                        <SubjectMenuSelector
                            key={`${j}-${subjectId}`}
                            value={subjectId ? idleSim.data.subjects[subjectId] : null}
                            setValue={x => handleAssignSubject(subjectId, i, x, j)}
                            options={freeSubjects}
                        />
                    )}
                </div>
                <div style={{ display: "flex", gap: "0.1rem" }}>
                    {department.agent_ids.map((agentId, j) =>
                        <AgentMenuSelector
                            key={`${j}-${agentId}`}
                            value={agentId ? idleSim.state.agents[agentId] : null}
                            setValue={x => handleAssignAgent(agentId, i, x, j)}
                            options={freeAgents}
                        />
                    )}
                </div>
                <div>
                    <button onClick={() => idleSim.updateUiState({ department: i })}>
                        Edit Details/Assign Schedule
                    </button>
                </div>
            </div>
        })}
    </div>
}

export default function FacilityTab({ idleSim }) {
    const [freeAgents, freeSubjects] = useMemo(() => {
        const assignedAgents = new Set();
        const assignedSubjects = new Set();

        idleSim.state.departments.forEach(dept => {
            dept.agent_ids.forEach(id => assignedAgents.add(id));
            dept.subject_ids.forEach(id => assignedSubjects.add(id));
        });

        idleSim.state.expeditions.forEach(exp => exp.agent_ids.forEach(id => assignedAgents.add(id)));
        idleSim.state.finished_expeditions.forEach(exp => exp.agent_ids.forEach(id => assignedAgents.add(id)));
        idleSim.state.pending_events.forEach(ev => ev.agent_ids.forEach(id => assignedAgents.add(id)));

        return [
            Object.keys(idleSim.state.agents).filter(id => !assignedAgents.has(Number(id))).map(id => idleSim.state.agents[id]),
            Object.keys(idleSim.state.subjects).filter(id => !assignedSubjects.has(id)).map(id => idleSim.data.subjects[id])
        ]
    },
        [idleSim.data, idleSim.state]
    );

    const handleAssignSubject = (subjectId, departmentIndex, newSubject, subjectIndex) => {
        if (!newSubject) idleSim.unassignSubject(subjectId);
        else idleSim.assignSubject(newSubject, departmentIndex, subjectIndex);
    }

    const handleAssignAgent = (agentId, departmentIndex, newAgent, agentIndex) => {
        if (!newAgent) idleSim.unassignAgent(agentId);
        else idleSim.assignAgent(newAgent, departmentIndex, agentIndex);
    }

    const props = {
        idleSim, freeAgents, freeSubjects, handleAssignAgent, handleAssignSubject
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%" }}>
        {idleSim.uiState.department || idleSim.uiState.department === 0 ?
            <DepartmentScreen {...props} /> :
            <ListScreen {...props} />
        }
    </div>;
}