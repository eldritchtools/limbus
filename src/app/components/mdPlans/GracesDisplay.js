"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useState } from "react";

import styles from "./GracesDisplay.module.css";
import { useData } from "../DataProvider";
import GraceIcon from "../icons/GraceIcon";
import Icon from "../icons/Icon";
import MarkdownRenderer from "../markdown/MarkdownRenderer";

function GraceComponent({ data, level, setLevel, setCurrentGrace, editable }) {
    const { isMobile } = useBreakpoint();

    const handleLevelSet = l => {
        setCurrentGrace();
        if (level === l) setLevel(0);
        else setLevel(l);
    }

    let componentClass = styles.graceComponent;
    if (!editable) componentClass = `${componentClass} ${level > 0 ? styles.active : styles.inactive}`;

    return <div className={componentClass} onClick={setCurrentGrace} style={{ width: isMobile ? "150px" : "175px" }}>
        <GraceIcon graceId={data.id} level={level} scale={isMobile ? 0.75 : 1} />
        <div>{data.name}</div>
        {editable ?
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className={`toggle-button ${level === 1 ? "active" : ""}`} onClick={() => handleLevelSet(1)}>-</button>
                <button className={`toggle-button ${level === 2 ? "active" : ""}`} onClick={() => handleLevelSet(2)}>+</button>
                <button className={`toggle-button ${level === 3 ? "active" : ""}`} onClick={() => handleLevelSet(3)}>++</button>
            </div> :
            null
        }
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontWeight: "bold" }}>
            <Icon path={"starlight"} style={{ width: "25px", height: "25px" }} />
            {data.cost * level}
        </div>
    </div>
}

export default function GracesDisplay({ graceLevels, setGraceLevels, editable = false }) {
    const [mdData, mdDataLoading] = useData("md/details");
    const [currentGrace, setCurrentGrace] = useState(0);
    const { isMobile } = useBreakpoint();

    const handleLevelSet = l => {
        setGraceLevels(p => p.map(() => l));
    }

    const constructDesc = () => {
        if (mdDataLoading) return null;

        const level = Math.max(graceLevels[currentGrace] - 1, 0);
        const descs = mdData.grace[currentGrace].descs[level];
        return <div style={{ whiteSpace: "pre-wrap", paddingRight: "0.2rem", textAlign: "start" }}>
            {descs.map((d, i) => <div key={i} style={{ display: "flex", alignItems: "start", gap: "0.2rem" }}>
                {
                    Array.isArray(d) ?
                        <div>
                            {d.map((d2, j) => <div key={j} style={{ display: "flex", alignItems: "start", gap: "0.2rem" }}>
                                <span>  -</span><MarkdownRenderer content={d2} />
                            </div>)}
                        </div> :
                        <><span>-</span><MarkdownRenderer content={d} /></>
                }
            </div>)}
        </div>
    }

    if (mdDataLoading) return null;

    return <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <div className={styles.graceGrid} style={{ gridTemplateColumns: isMobile ? "repeat(2, 150px)" : "repeat(5, 175px)" }}>
            {mdData.grace.sort((a, b) => a.index - b.index).map(grace =>
                <GraceComponent
                    key={grace.id} data={grace}
                    level={graceLevels[grace.index - 1]}
                    setLevel={v => setGraceLevels(p => p.map((x, i) => i === grace.index - 1 ? v : x))}
                    setCurrentGrace={() => setCurrentGrace(grace.index - 1)}
                    editable={editable}
                />
            )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", border: "1px #aaa solid", borderRadius: "1rem", padding: "0.5rem", alignItems: "center", width: "350px" }}>
            {editable ? <>
                <span>Set All Graces</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => handleLevelSet(0)}>x</button>
                    <button onClick={() => handleLevelSet(1)}>-</button>
                    <button onClick={() => handleLevelSet(2)}>+</button>
                    <button onClick={() => handleLevelSet(3)}>++</button>
                </div>
                <div style={{ border: "1px #aaa solid", width: "100%", margin: "0.5rem" }} />
            </> :
                null
            }
            <GraceIcon graceId={mdData.grace[currentGrace].id} level={graceLevels[currentGrace]} />
            <div>{mdData.grace[currentGrace].name}</div>
            <div style={{ height: "180px", width: "100%", overflowY: "auto", marginTop: "0.2rem" }}>
                {constructDesc()}
            </div>
        </div>
    </div>
}
