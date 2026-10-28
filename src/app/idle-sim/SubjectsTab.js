import { useMemo, useState } from "react";

import { StatTable } from "./components";
import { SubjectSprite } from "./icons";
import styles from "./idleSim.module.css";
import { researchXpToNext } from "./util";
import DropdownButton from "../components/objects/DropdownButton";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";

function Subject({ idleSim }) {
    const subjectId = idleSim.uiState.subject;
    const subjectData = idleSim.data.subjects[subjectId];
    const subjectState = idleSim.state.subjects[subjectId];

    return <>
        <button onClick={() => idleSim.updateUiState({ subject: null })}>Go Back</button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <SubjectSprite width={250} height={250} src={subjectData.src} style={{ filter: subjectState ? "" : "brightness(0)" }} />
                <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>{subjectState ? subjectData.name : "???"}</span>
                {subjectState &&
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 100px)", gap: "0.5rem", alignItems: "center", justifyItems: "center" }}>
                        <span>WE Req:</span>
                        <span>Res Lvl:</span>
                        <span>Res XP:</span>

                        <span style={{ fontSize: "1.5rem" }}
                            {...getGeneralTooltipProps("Work Efficiency Requirement\nEstimated effective work efficiency expected from the agent doing work on this subject to achieve good results.")}
                        >
                            {subjectData.we_req}
                        </span>
                        <span style={{ fontWeight: "bold", fontSize: "2rem" }}
                            {...getGeneralTooltipProps("Research Level\nCurrent research level of the subject. Higher research levels give small boosts to the work efficiency of agents that work on this subject and may unlock weapons and armor for purchase.")}
                        >
                            {subjectState.research_level}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}
                            {...getGeneralTooltipProps("Research XP\nXP required to reach the next research level. Each good, average, or bad instance of work an agent does on the subject gives 2, 1, or 0 XP respectively.")}
                        >
                            <span>{subjectState.research_xp}</span>
                            <div style={{ width: "100%", border: "1px var(--primary-border-color) solid" }} />
                            <span>{researchXpToNext(subjectState.research_level)}</span>
                        </div>
                    </div>
                }
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {subjectState ?
                    <>
                        <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>Stats</span>
                        <StatTable data={subjectData} />
                        <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>Unlocks</span>
                        <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "0.2rem" }}>

                        </div>
                    </> :
                    <>
                        <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>How to Obtain</span>
                    </>
                }
            </div>
        </div>
    </>
}

function SubjectsGrid({ idleSim, subjectsList }) {
    return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem", width: "100%" }}>
        {subjectsList.map(id => {
            const subject = idleSim.data.subjects[id];
            const owned = id in idleSim.state.subjects;
            return <div key={id} className={styles.clickableTile} onClick={() => idleSim.updateUiState({ subject: id })}>
                <SubjectSprite width={150} height={150} src={subject.src} style={{ filter: owned ? "" : "brightness(0)" }} />
                <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>{owned ? subject.name : "???"}</span>
            </div>
        })}
    </div>
}

export default function SubjectsTab({ idleSim }) {
    const [filter, setFilter] = useState("owned");

    const subjectsList = useMemo(() => {
        if (filter === "owned")
            return Object.keys(idleSim.state.subjects);

        if (filter === "unowned")
            return Object.entries(idleSim.data.subjects).filter(([k, v]) => !v.enemy_only && !(k in idleSim.state.subjects)).map(([k]) => k);

        if (filter === "all")
            return Object.entries(idleSim.data.subjects).filter(([, v]) => !v.enemy_only).map(([k]) => k);

        return [];
    }, [idleSim, filter]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%" }}>
        {idleSim.uiState.subject ?
            <Subject idleSim={idleSim} /> :
            <>
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    Filter:
                    <DropdownButton value={filter} setValue={setFilter}
                        options={{ owned: "Owned", unowned: "Unowned", all: "All" }}
                    />
                </div>
                <SubjectsGrid idleSim={idleSim} subjectsList={subjectsList} />
            </>
        }
    </div>;
}