"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactTimeAgo from "react-time-ago";

import styles from "./achievements.module.css";
import { constructAchievementsData, getDefaultMigration, handleMigration } from "./migration";
import AchievementTips from "./Tips";
import { useData } from "../components/DataProvider";
import NumberInput from "../components/objects/NumberInput";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { getAchievementsProgress, updateAchievementsProgress } from "../database/achievements";
import { useAuth } from "../database/authProvider";
import { localStores } from "../database/localDB";
import useLocalState from "../lib/useLocalState";

function Achievement({ achievement, tracking, setAchievementTracking, isSmall }) {
    const [isOpen, setIsOpen] = useState(false);
    const checkboxRef = useRef(null);

    const isChecked = Array.isArray(achievement.points) ? tracking[achievement.id] > achievement.points.length - 1 : tracking[achievement.id] > 0;
    const isPartial = Array.isArray(achievement.points) ? tracking[achievement.id] > 0 && tracking[achievement.id] <= achievement.points.length - 1 : false;

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = isPartial;
        }
    }, [isPartial]);

    let subAchievements = null;
    let achievementText = achievement.text;

    if ("replace" in achievement) {
        Object.entries(achievement.replace).forEach(([key, values]) =>
            achievementText = achievementText.replace(`[${key}]`, values[0] + "~" + values[values.length - 1])
        );

        subAchievements = [];
        for (let i = 0; i < achievement.points.length; i++) {
            let text = achievement.text;
            Object.entries(achievement.replace).forEach(([key, values]) => text = text.replace(`[${key}]`, values[i]));
            subAchievements.push(<div key={subAchievements.length} className={styles.subitem}>
                <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                    <label className={styles.checkboxContainer}>
                        <input type="checkbox" onChange={() => {
                            if (tracking[achievement.id] > i) setAchievementTracking(i);
                            else setAchievementTracking(i + 1);
                        }} checked={tracking[achievement.id] > i} />
                        <span className={styles.checkmark} />
                    </label>
                    <span className={styles.points}>+{achievement.points[i]}</span>
                    <span className={styles.itemLabel}>{text}</span>
                </div>
                {achievement.hardonly[i] ?
                    <span style={{ minWidth: "4rem", textAlign: "center", color: "#f87171" }}>Hard only</span> :
                    <span style={{ minWidth: "4rem", textAlign: "center", color: "#4ade80" }}>Normal or Hard</span>
                }
            </div>);
        }
    }

    const hardonly = Array.isArray(achievement.hardonly) ? !achievement.hardonly.some(x => x === false) : achievement.hardonly;
    const points = Array.isArray(achievement.points) ? achievement.points.reduce((acc, x) => acc + x, 0) : achievement.points;
    const len = Array.isArray(achievement.points) ? achievement.points.length : 1;

    return <details className={styles.details} onToggle={e => setIsOpen(e.target.open)}>
        <summary className={styles.summary}>
            <div style={{ display: "flex", gap: "0.1rem", width: "85%", alignItems: "center" }}>
                <label className={styles.checkboxContainer}>
                    <input ref={checkboxRef} type="checkbox" onChange={() => {
                        if (isChecked) setAchievementTracking(0);
                        else setAchievementTracking(len);
                    }} checked={isChecked} />
                    <span className={`${styles.checkmark} ${isPartial ? styles.partial : isChecked ? styles.checked : ""}`} />
                </label>
                <span className={styles.points}>+{points}</span>
                <span className={styles.itemLabel}>{achievementText}</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", width: "15%", justifyContent: "end", alignItems: "center" }}>
                {hardonly ?
                    <span style={{ minWidth: "4rem", color: "#f87171" }}>Hard only</span> :
                    <span style={{ minWidth: "4rem", color: "#4ade80" }}>Normal or Hard</span>
                }
                <span className={styles.arrow}>▼</span>
            </div>
        </summary>
        <div style={{ padding: "0.5rem 1.5rem 0.1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {subAchievements ? <div>{subAchievements}</div> : null}
            {isOpen ?
                <div style={{ width: "100%", textAlign: "start" }}> 
                    <AchievementTips achievement={achievement} isSmall={isSmall} /> 
                </div> :
                null
            }
        </div>
    </details>
}

function AchievementTab({ achievements, sortClearedToBottom, tracking, setAchievementTracking, isSmall }) {
    const { isDesktop } = useBreakpoint();

    const style = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: isDesktop ? "90%" : "100%",
        paddingBottom: "2.5rem"
    };

    const components = useMemo(() => {
        return achievements.map((ach, i) => [
            (tracking[ach.id] ?? 0) === (Array.isArray(ach.points) ? ach.points.length : 1),
            i,
            <Achievement
                key={ach.id}
                achievement={ach}
                tracking={tracking}
                setAchievementTracking={(value) => setAchievementTracking(ach.id, value)}
                isSmall={isSmall}
            />
        ])
    }, [achievements, setAchievementTracking, isSmall, tracking]);

    const sorted = useMemo(() => {
        if (sortClearedToBottom)
            return components
                .sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0])
                .map(x => x[2])
        else
            return components
                .sort((a, b) => a[1] - b[1])
                .map(x => x[2])
    }, [components, sortClearedToBottom])

    return <div style={style}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", flexShrink: 0 }}>
            {sorted}
        </div>
    </div>
}

function RewardsTab({ totalPoints, columns = 2 }) {
    const currentLevel = Math.floor(totalPoints / 100);
    const [rewards, rewardsLoading] = useData("md/rewards");
    if (rewardsLoading) return null;

    const [rewardsDone, rewardsTodo, levelComponents] = Object.entries(rewards).reduce((acc, [level, reward]) => {
        if (parseInt(level) <= currentLevel) {
            if (reward.item in acc[0]) acc[0][reward.item] += reward.count;
            else acc[0][reward.item] = reward.count;

            acc[2].push(<div key={acc[2].length} style={{ display: "grid", gridTemplateColumns: "1fr 4fr", textAlign: "center" }}>
                <span style={{ textDecoration: "line-through", padding: "0.1rem", border: "1px #666 dotted" }}>{level}</span>
                <span style={{ textDecoration: "line-through", padding: "0.1rem", border: "1px #666 dotted" }}>{reward.count}x {reward.item}</span>
            </div>);
        } else {
            if (reward.item in acc[1]) acc[1][reward.item] += reward.count;
            else acc[1][reward.item] = reward.count;

            acc[2].push(<div key={acc[2].length} style={{ display: "grid", gridTemplateColumns: "1fr 4fr", textAlign: "center" }}>
                <span style={{ padding: "0.1rem", border: "1px #666 dotted" }}>{level}</span>
                <span style={{ padding: "0.1rem", border: "1px #666 dotted" }}>{reward.count}x {reward.item}</span>
            </div>);
        }

        return acc;
    }, [{}, {}, []]);


    const colLengths = Array.from({ length: columns }, (_, i) => Math.floor(levelComponents.length / columns) + (i < levelComponents.length % columns ? 1 : 0));
    const colStarts = colLengths.reduce((acc, length) => { acc.push(acc[acc.length - 1] + length); return acc; }, [0]);

    const reorderedComponents = [];
    for (let i = 0; i < colLengths[0]; i++) {
        for (let j = 0; j < columns; j++) {
            if (i >= colLengths[j]) break;
            const num = colStarts[j] + i;
            if (num >= levelComponents.length) break;
            reorderedComponents.push(levelComponents[num]);
        }
    }

    const headers = [];
    for (let i = 0; i < columns; i++) {
        headers.push(<div style={{ display: "grid", gridTemplateColumns: "1fr 4fr", textAlign: "center" }}>
            <span style={{ fontWeight: "bold", padding: "0.1rem", border: "1px #666 dotted" }}>Level</span>
            <span style={{ fontWeight: "bold", padding: "0.1rem", border: "1px #666 dotted" }}>Reward</span>
        </div>);
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.1rem" }}>
            <div style={{ paddingLeft: "1rem" }}>
                <div style={{ fontWeight: "bold" }}>Rewards Obtained:</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {Object.entries(rewardsDone).map(([item, count], i) => <span key={i}>{count}x {item}</span>)}
                </div>
            </div>
            <div style={{ paddingLeft: "1rem" }}>
                <div style={{ fontWeight: "bold" }}>Rewards To Get:</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {Object.entries(rewardsTodo).map(([item, count], i) => <span key={i}>{count}x {item}</span>)}
                </div>
            </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {headers}
            {reorderedComponents}
        </div>
    </div>;
}

export default function AchievementsPage() {
    const { user } = useAuth();
    const [achievementsPre, achievementsLoading] = useData("md/achievements");
    const [sortClearedToBottom, setSortClearedToBottom] = useLocalState("achievementsSortToBottom", false);
    const [activeTab, setActiveTab] = useLocalState("achievementsTab", null);

    const [tracking, setTracking] = useState(null);
    const [points, setPoints] = useState(null);
    const [additionalPoints, setAdditionalPoints] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [loaded, setLoaded] = useState(false);
    const [changed, setChanged] = useState(false);

    const [lastSaved, setLastSaved] = useState(null);
    const [saveStatus, setSaveStatus] = useState("idle");
    const saveTimeout = useRef(null);

    const { isDesktop } = useBreakpoint();

    const [achievements, achievementsMapped] = useMemo(() => {
        if (achievementsLoading) return [{}, {}];
        const { "__Season__": s, ...rest } = achievementsPre;
        const mapped = {};
        Object.values(rest).forEach(list => list.forEach(ach => mapped[ach.id] = ach))
        return [rest, mapped];
    },
        [achievementsPre, achievementsLoading]
    );

    useEffect(() => {
        if (achievementsLoading || Object.keys(achievementsMapped).length === 0 || loaded) return;

        const setState = data => {
            setTracking(data.tracking);
            let pts = 0;
            Object.entries(data.tracking).forEach(([id, tier]) => {
                if (tier === 0) return;
                const achievement = achievementsMapped[id];
                if (Array.isArray(achievement.points)) {
                    for (let i = 0; i < tier; i++) pts += achievement.points[i];
                } else {
                    pts += achievement.points
                }
            })
            setPoints(pts);
            setAdditionalPoints(data.additionalPoints);
            setDataLoading(false);
        }

        const handleAchievements = data => {
            setState(handleMigration(data, achievementsPre));
        }

        const handleNoAchievements = () => {
            setState(getDefaultMigration(achievementsPre));
        }

        const loadData = async () => {
            if (user) {
                const saved = await getAchievementsProgress(user);
                if (saved) {
                    handleAchievements({
                        season: saved.season_key,
                        tracking: saved.progress,
                        additionalPoints: saved.additional_points
                    });
                } else {
                    handleNoAchievements();
                }
            } else {
                const saved = await localStores["achievements"].get("main");
                if (saved) {
                    handleAchievements(saved);
                } else {
                    handleNoAchievements();
                }
            }
        }
        loadData();
        setLoaded(true);
    }, [achievementsLoading, achievementsPre, achievementsMapped, loaded, user]);

    const setAchievementTracking = (id, value) => {
        let totalPoints = points;
        const achievement = achievementsMapped[id];
        if (Array.isArray(achievement.points)) {
            let v = tracking[id] ?? 0;
            let diff = 0;
            while (v < value) diff += achievement.points[v++];
            while (v > value) diff -= achievement.points[--v];

            totalPoints += diff;
        } else {
            if (value === 1) totalPoints += achievement.points;
            else totalPoints -= achievement.points;
        }

        setPoints(totalPoints);

        if (value === 0) {
            setTracking(p => {
                const { [id]: x, ...rest } = p;
                return rest;
            });
        } else {
            setTracking(p => ({ ...p, [id]: value }));
        }

        setChanged(true);
    }

    useEffect(() => {
        if (dataLoading || isNaN(additionalPoints) || !changed) return;

        const saveData = async () => {
            const data = constructAchievementsData(tracking, additionalPoints, achievementsPre);

            if (user) {
                await updateAchievementsProgress(user, data);
            } else {
                await localStores["achievements"].save({ ...data, id: "main" });
            }
        };

        clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(async () => {
            setSaveStatus("saving");
            try {
                await saveData();
                setSaveStatus("saved");
                setLastSaved(new Date());
                setChanged(false);
            } catch (err) {
                setSaveStatus("error");
                setChanged(false);
            }
        }, 5000);

        return () => clearTimeout(saveTimeout.current);
    }, [tracking, points, additionalPoints, achievementsPre, dataLoading, changed, user]);

    const xp = useMemo(() => {
        if (!additionalPoints || isNaN(additionalPoints)) return points;
        return Math.min(points + additionalPoints, 10000);
    }, [points, additionalPoints]);

    const toggleSortClearedToBottom = () => {
        setSortClearedToBottom(p => !p);
    }

    const handleAdditionalPoints = v => {
        setAdditionalPoints(v);
        setChanged(true);
    }

    const saveString = useMemo(() => {
        if (saveStatus === "idle") return null;
        if (saveStatus === "saving") return "Saving changes";
        if (saveStatus === "saved") return <div>Last Saved: <ReactTimeAgo date={lastSaved} locale="en-US" timeStyle="mini" /> ago</div>;
        if (saveStatus === "error") return "Unable to save changes";
        return null;
    }, [saveStatus, lastSaved]);

    if (achievementsLoading || dataLoading) return <LoadingContentPageTemplate />;

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%" }}>
        <div>Progress is automatically saved after a few seconds of inactivity.</div>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
                <div>Level: {Math.floor(xp / 100)}</div>
                <div style={{ width: "5rem", height: "20px", backgroundColor: "#333", borderRadius: "5px", overflow: "hidden", position: "relative" }}>
                    <div style={{ width: `${xp % 100}%`, height: "100%", backgroundColor: "#4caf50", transition: "width 0.3s ease" }} />
                    <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontWeight: "bold", textShadow: "0 0 8px #000" }}> {xp % 100}/100 </span>
                </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                Additional XP:
                <NumberInput
                    value={additionalPoints ?? 0}
                    onChange={handleAdditionalPoints}
                    min={0}
                    style={{ textAlign: "center", width: "6ch" }}
                />
            </div>
            <div>
                {saveString}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", justifyContent: "center" }}>
            <button className={`toggle-button ${sortClearedToBottom ? 'active' : ''}`} onClick={toggleSortClearedToBottom}>Sort Cleared to Bottom</button>
        </div>

        <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            <h2 style={{ display: "flex", margin: "0 0 10px", padding: 0, gap: "1rem", alignItems: "center", justifyContent: "center", width: "max-content" }}>
                {Object.entries(achievements).map(([category]) =>
                    <div
                        key={category}
                        className={`tab-header ${activeTab === category ? "active" : ""}`}
                        style={{ fontSize: "1rem" }}
                        onClick={() => setActiveTab(category)}
                    >
                        {category}
                    </div>
                )}
                <div
                    key={"rewards"}
                    className={`tab-header ${activeTab === "rewards" ? "active" : ""}`}
                    style={{ fontSize: "1rem" }}
                    onClick={() => setActiveTab("rewards")}
                >
                    Rewards
                </div>
            </h2>
        </div>

        {
            activeTab === "rewards" ?
                <RewardsTab totalPoints={xp} /> :
                activeTab in achievements ?
                    <AchievementTab
                        achievements={achievements[activeTab]}
                        sortClearedToBottom={sortClearedToBottom}
                        tracking={tracking}
                        setAchievementTracking={setAchievementTracking}
                        isSmall={!isDesktop}
                    /> :
                    <span>Select a category above to get started.</span>
        }
    </div>
}
