"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./LunacySection.module.css";
import ThreeStateToggle from "./ThreeStateToggle";
import { useData } from "../components/DataProvider";
import DropdownButton from "../components/objects/DropdownButton";
import NumberInput from "../components/objects/NumberInput";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import PageHeader from "../components/pageTemplates/PageHeader";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { getLocalStore } from "../database/localDB";
import { uiColors } from "../lib/colors";
import { triggerToolUsedGAEvent } from "../lib/gaEvents";

const STORY_NODE_LUNACY = 40;
const STORY_DUNGEON_LUNACY = 200;
const STORY_SECTION_LUNACY = 130;
const STORY_COMPLETION_LUNACY = 260;
const LUXCAVATION_LUNACY = 40;
const MD_LUNACY = 750;
const MAINTENANCE_LUNACY = 300;
const REFRESH_LUNACY = n => 26 * (n * (n + 1)) / 2;
const UPTIE_LUNACY = 40;

function LunacySection({ title, remain, status, onStatusChange, children }) {
    return <div className={styles.section}>
        <div className={styles.sectionHeader}>
            <ThreeStateToggle value={status} onChange={onStatusChange} />
            <span className={styles.sectionHeaderTitle}>{title}</span>
            <span className="sub-text">{remain.toLocaleString()} Lunacy</span>
        </div>

        {children}
    </div>
}

function SummarySection({ computations, current, setCurrent, other, setOther }) {
    return <div className={styles.section}>
        <div className={styles.sectionHeader}>
            <span className={styles.sectionHeaderTitle}>Summary</span>
        </div>

        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Section</th>
                        <th>Lunacy</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Current Lunacy</td>
                        <td>
                            <NumberInput className={styles.numberInput} style={{ width: "8ch" }} min={0}
                                value={current} onChange={v => setCurrent(v)} />
                        </td>
                    </tr>
                    <tr>
                        <td>Recurring Sources</td>
                        <td style={{ color: computations.recurringTotal < 0 ? uiColors.red : null }}>
                            {computations.recurringTotal.toLocaleString()}
                        </td>
                    </tr>
                    {computations.storyStatus !== "excluded" &&
                        <tr>
                            <td>Story</td>
                            <td>{computations.storyRemain.toLocaleString()}</td>
                        </tr>
                    }
                    {computations.luxStatus !== "excluded" &&
                        <tr>
                            <td>Luxcavation</td>
                            <td>{computations.luxRemain.toLocaleString()}</td>
                        </tr>
                    }
                    {computations.reflectrialStatus !== "excluded" &&
                        <tr>
                            <td>Reflectrial</td>
                            <td>{computations.reflectrialRemain.toLocaleString()}</td>
                        </tr>
                    }
                    {computations.eventStatus !== "excluded" &&
                        <tr>
                            <td>Ongoing Events</td>
                            <td>{computations.eventRemain.toLocaleString()}</td>
                        </tr>
                    }
                    {computations.paidPassStatus !== "excluded" &&
                        <tr>
                            <td>Paid Battle Pass</td>
                            <td>{computations.paidPassRemain.toLocaleString()}</td>
                        </tr>
                    }
                    <tr>
                        <td>Others</td>
                        <td>
                            <NumberInput className={styles.numberInput} style={{ width: "8ch" }}
                                value={other} onChange={v => setOther(v)} />
                        </td>
                    </tr>
                    <tr style={{ fontWeight: "bold", fontSize: "1rem", color: computations.total < 0 ? uiColors.red : null }}>
                        <td>Total</td>
                        <td>{computations.total.toLocaleString()}</td>
                    </tr>
                    <tr style={{ fontWeight: "bold", fontSize: "1rem", color: computations.total < 0 ? uiColors.red : null }}>
                        <td>Total (in pulls)</td>
                        <td>{(Math.round(100 * computations.total / 130) / 100).toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
}

function RecurringSection({ startDate, endDate, dailyRefresh, upties, total, weeks, days, setStartDate, setEndDate, setDailyRefresh, setUpties }) {
    const [timers, timersLoading] = useData("timers");

    const quickSetOptions = useMemo(() => {
        if (timersLoading) return {};

        const yesterday = value => {
            const [year, month, day] = value.split("-").map(Number);
            const date = new Date(Date.UTC(year, month - 1, day));
            date.setUTCDate(date.getUTCDate() - 1);

            const newYear = date.getFullYear();
            const newMonth = String(date.getMonth() + 1).padStart(2, "0");
            const newDay = String(date.getDate()).padStart(2, "0");

            return `${newYear}-${newMonth}-${newDay}`;
        };

        const options = {};

        const addOption = item => {
            if (startDate.localeCompare(item.startDate) < 0) {
                if (!(item.startDate in options)) options[item.startDate] = `${item.startDate}: ${item.name} (Start)`;
            }

            if (item.endDate) {
                const end = yesterday(item.endDate);
                if (startDate.localeCompare(end) < 0) {
                    if (!(end in options)) options[end] = `${end}: ${item.name} (End)`;
                }
            }
        }

        addOption(timers.banners.main);
        timers.banners.others.forEach(x => addOption(x));

        return options;
    }, [timers, timersLoading, startDate]);

    return <div className={styles.section}>
        <div className={styles.sectionHeader}>
            <span className={styles.sectionHeaderTitle}>Recurring Sources/Costs</span>
            <span className="sub-text">{total.toLocaleString()} Lunacy</span>
        </div>

        <span className="sub-text" style={{ textAlign: "center", padding: "0.2rem 0" }}>
            Weeklies count every Thursday within the selected range as a week.
        </span>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
            <label>Start Date: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
            <label>End Date: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
            {!timersLoading &&
                <DropdownButton value={null} setValue={x => setEndDate(x)} options={quickSetOptions} defaultDisplay={"≡"} />
            }
        </div>

        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Source</th>
                        <th>Details</th>
                        <th>Lunacy</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Weekly Mirror Dungeon</td>
                        <td>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", alignItems: "center", justifyItems: "center" }}>
                                <span>750 / Week</span>
                                <span>{weeks} {weeks === 1 ? "week" : "weeks"}</span>
                            </div>
                        </td>
                        <td>{(weeks * MD_LUNACY).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>Weekly Maintenance</td>
                        <td>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", alignItems: "center", justifyItems: "center" }}>
                                <span>300 / Week</span>
                                <span>{weeks} {weeks === 1 ? "week" : "weeks"}</span>
                            </div>
                        </td>
                        <td>{(weeks * MAINTENANCE_LUNACY).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>Daily Refresh</td>
                        <td>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", alignItems: "center", justifyItems: "center" }}>
                                <span>
                                    <NumberInput className={styles.numberInput} min={0} max={10}
                                        value={dailyRefresh} onChange={v => setDailyRefresh(v)} />
                                    Refreshes
                                </span>
                                <span>{REFRESH_LUNACY(dailyRefresh)} / Day</span>
                                <span>{days} {days === 1 ? "day" : "days"}</span>
                            </div>
                        </td>
                        <td style={{ color: uiColors.red }}>{(-1 * REFRESH_LUNACY(dailyRefresh) * days).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>Uptie Rewards</td>
                        <td>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", alignItems: "center", justifyItems: "center" }}>
                                <span>
                                    <NumberInput className={styles.numberInput} min={0}
                                        value={upties} onChange={v => setUpties(v)} />
                                    Identities
                                </span>
                                <span>{UPTIE_LUNACY} / Identity</span>
                            </div>
                        </td>
                        <td>{(upties * UPTIE_LUNACY).toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
}

function StorySection({ lunacyData, remain, status, userState, setUserState }) {
    const setStatus = (state, id, status) => {
        if (status === "excluded") {
            state[id] = { ...(state[id] ?? {}), excluded: true };
        } else {
            delete state[id]?.excluded;
        }

        if (status === "claimed") {
            const data = lunacyData.story.find(x => x.id === id);
            state[id] = { ...state[id], nodes: data.nodes, dungeons: data.dungeons ?? 0, sections: 3 };
        }

        if (status === "unclaimed") {
            delete state[id];
        }
    }

    const setAllStatus = status => {
        setUserState(p => {
            const newState = { ...p };
            lunacyData.story.forEach(x => setStatus(newState, x.id, status));
            return newState;
        })
    }

    const setSingleStatus = (id, status) => {
        setUserState(p => {
            const newState = { ...p };
            setStatus(newState, id, status);
            return newState;
        })
    }

    const setField = (id, key, value) => {
        setUserState(p => ({ ...p, [id]: { ...p[id], [key]: value } }))
    }

    return <LunacySection title="Story" remain={remain} status={status} onStatusChange={setAllStatus}>
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th></th>
                        <th>Canto/Intervallo</th>
                        <th>Nodes</th>
                        <th>Dungeons</th>
                        <th>Sections</th>
                        <th>Lunacy</th>
                    </tr>
                </thead>
                <tbody>
                    {lunacyData.story.map(x => {
                        const state = { nodes: 0, dungeons: 0, sections: 0, ...(userState[x.id] ?? {}) };
                        const status = state.excluded ? "excluded" :
                            state.nodes === x.nodes && state.dungeons === (x.dungeons ?? 0) && state.sections === 3 ? "claimed" : "unclaimed";

                        let rem = 0;
                        if (!state.excluded) {
                            rem += (x.nodes - state.nodes) * STORY_NODE_LUNACY;
                            rem += ((x.dungeons ?? 0) - state.dungeons) * STORY_DUNGEON_LUNACY;
                            rem += (3 - state.sections) * (x.sectionReward ?? STORY_SECTION_LUNACY);
                            if (state.sections < 3) rem += STORY_COMPLETION_LUNACY;
                        }

                        return <tr key={x.id}>
                            <td><ThreeStateToggle value={status} onChange={value => setSingleStatus(x.id, value)} /></td>
                            <td>{x.label}</td>
                            <td {...getGeneralTooltipProps(`${STORY_NODE_LUNACY} per non dungeon node`)}>
                                <NumberInput className={styles.numberInput} min={0} max={x.nodes}
                                    value={state.nodes} onChange={v => setField(x.id, "nodes", v)} />
                                / {x.nodes}
                            </td>
                            <td {...getGeneralTooltipProps(`${STORY_DUNGEON_LUNACY} per dungeon node`)}>
                                {
                                    x.dungeons ? <>
                                        <NumberInput className={styles.numberInput} min={0} max={x.dungeons}
                                            value={state.dungeons} onChange={v => setField(x.id, "dungeons", v)} />
                                        / {x.dungeons}
                                    </> :
                                        0
                                }
                            </td>
                            <td {...getGeneralTooltipProps(`${x.sectionReward ?? STORY_SECTION_LUNACY} per section plus ${STORY_COMPLETION_LUNACY} for full completion`)}>
                                <NumberInput className={styles.numberInput} min={0} max={3}
                                    value={state.sections} onChange={v => setField(x.id, "sections", v)} />
                                / 3
                            </td>
                            <td>{rem.toLocaleString()}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    </LunacySection>;
}

function LuxcavationSection({ lunacyData, remain, status, userState, setUserState }) {
    const setStatus = (state, id, status) => {
        if (status === "excluded") {
            state[id] = { ...(state[id] ?? {}), excluded: true };
        } else {
            delete state[id]?.excluded;
        }

        if (status === "claimed") {
            const data = lunacyData.luxcavation.find(x => x.id === id);
            state[id] = { ...state[id], count: data.count };
        }

        if (status === "unclaimed") {
            delete state[id];
        }
    }

    const setAllStatus = status => {
        setUserState(p => {
            const newState = { ...p };
            lunacyData.luxcavation.forEach(x => setStatus(newState, x.id, status));
            return newState;
        })
    }

    const setSingleStatus = (id, status) => {
        setUserState(p => {
            const newState = { ...p };
            setStatus(newState, id, status);
            return newState;
        })
    }

    const setField = (id, key, value) => {
        setUserState(p => ({ ...p, [id]: { ...p[id], [key]: value } }))
    }

    return <LunacySection title="Luxcavation" remain={remain} status={status} onStatusChange={setAllStatus}>
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th></th>
                        <th>Luxcavation Set</th>
                        <th>Stages</th>
                        <th>Lunacy</th>
                    </tr>
                </thead>
                <tbody>
                    {lunacyData.luxcavation.map(x => {
                        const state = { count: 0, ...(userState[x.id] ?? {}) };
                        const status = state.excluded ? "excluded" : state.count === x.count ? "claimed" : "unclaimed";
                        const rem = state.excluded ? 0 : (x.count - state.count) * LUXCAVATION_LUNACY;

                        return <tr key={x.id}>
                            <td><ThreeStateToggle value={status} onChange={value => setSingleStatus(x.id, value)} /></td>
                            <td>{x.label}</td>
                            <td {...getGeneralTooltipProps(`${LUXCAVATION_LUNACY} per stage`)}>
                                <NumberInput className={styles.numberInput} min={0} max={x.count}
                                    value={state.count} onChange={v => setField(x.id, "count", v)} />
                                / {x.count}
                            </td>
                            <td>{rem.toLocaleString()}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    </LunacySection>;
}

function ValueSection({ lunacyData, title, itemLabel, section, remain, status, userState, setUserState }) {
    const setStatus = (state, id, status) => {
        if (status === "excluded") {
            state[id] = { ...(state[id] ?? {}), excluded: true };
        } else {
            delete state[id]?.excluded;
        }

        if (status === "claimed") {
            state[id] = { ...state[id], claimed: true };
        }

        if (status === "unclaimed") {
            delete state[id];
        }
    }

    const setAllStatus = status => {
        setUserState(p => {
            const newState = { ...p };
            lunacyData[section].forEach(x => setStatus(newState, x.id, status));
            return newState;
        })
    }

    const setSingleStatus = (id, status) => {
        setUserState(p => {
            const newState = { ...p };
            setStatus(newState, id, status);
            return newState;
        })
    }

    return <LunacySection title={title} remain={remain} status={status} onStatusChange={setAllStatus}>
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th></th>
                        <th>{itemLabel ?? title}</th>
                        <th>Lunacy</th>
                    </tr>
                </thead>
                <tbody>
                    {lunacyData[section].map(x => {
                        const state = { count: 0, ...(userState[x.id] ?? {}) };
                        const status = state.excluded ? "excluded" : state.claimed ? "claimed" : "unclaimed";
                        const rem = state.excluded || state.claimed ? 0 : x.value;

                        return <tr key={x.id}>
                            <td><ThreeStateToggle value={status} onChange={value => setSingleStatus(x.id, value)} /></td>
                            <td>{x.label}</td>
                            <td>{rem.toLocaleString()}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    </LunacySection>;
}

function getToday() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export default function LunacyCalculatorPage() {
    const [lunacyData, lunacyDataLoading] = useData("lunacy_data");
    const [current, setCurrent] = useState(0);
    const [other, setOther] = useState(0);
    const [userState, setUserState] = useState({});
    const [upties, setUpties] = useState(0);
    const [startDate, setStartDate] = useState(getToday());
    const [endDate, setEndDate] = useState(getToday());
    const [dailyRefresh, setDailyRefresh] = useState(0);

    const [initializing, setInitializing] = useState(true);
    const [firstSave, setFirstSave] = useState(true);
    const saveTimeout = useRef(null);

    useEffect(() => {
        if (!initializing || lunacyDataLoading) return;
        const handleData = data => {
            setInitializing(false);
            if (!data) return;
            if (data.current) setCurrent(data.current);
            if (data.other) setOther(data.other);
            if (data.userState) {
                const ids = new Set();
                Object.entries(lunacyData).forEach(([, list]) => {
                    if (Array.isArray(list)) list.forEach(x => ids.add(x.id))
                })

                setUserState(Object.fromEntries(Object.entries(data.userState).filter(([id]) => ids.has(id))));
            }
            if (data.upties) setUpties(data.upties);
            if (data.startDate) setStartDate(p => p.localeCompare(data.startDate) < 0 ? data.startDate : p);
            if (data.endDate) setEndDate(data.endDate);
            if (data.dailyRefresh) setDailyRefresh(data.dailyRefresh);
        }

        getLocalStore("lunacyCalc").get("main").then(handleData);
    }, [initializing, lunacyData, lunacyDataLoading]);

    useEffect(() => {
        if (initializing) return;

        const saveData = async () => {
            const data = { id: "main", current, other, userState, upties, startDate, endDate, dailyRefresh };
            await getLocalStore("lunacyCalc").save(data);

            if (firstSave) {
                triggerToolUsedGAEvent("Lunacy Calculator");
                setFirstSave(false);
            }
        };

        clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(async () => {
            try {
                await saveData();
            } catch (err) {
                console.error("Unable to persist data.");
            }
        }, 1000);

        return () => clearTimeout(saveTimeout.current);
    }, [initializing, firstSave, current, other, userState, upties, startDate, endDate, dailyRefresh]);

    const computations = useMemo(() => {
        if (lunacyDataLoading) return new Array(10).fill(null);

        const parseDate = value => {
            const [year, month, day] = value.split("-").map(Number);
            return new Date(Date.UTC(year, month - 1, day));
        };

        const countDays = (from, to) => Math.max(0, Math.round((parseDate(to) - parseDate(from)) / 86400000) + 1);

        const countThursdays = (from, to) => {
            const start = parseDate(from);
            const end = parseDate(to);

            let count = 0;

            for (let date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 1)) {
                if (date.getUTCDay() === 4) count++;
            }

            return count;
        };

        console.log(startDate, endDate);
        const weeks = countThursdays(startDate, endDate);
        const days = countDays(startDate, endDate);
        const recurringTotal = (MD_LUNACY + MAINTENANCE_LUNACY) * weeks - REFRESH_LUNACY(dailyRefresh) * days + upties * UPTIE_LUNACY;

        let storyClaimed = 0;
        let storyTotal = 0;

        lunacyData.story.forEach(x => {
            const state = { nodes: 0, dungeons: 0, sections: 0, ...(userState[x.id] ?? {}) };
            if (state.excluded) return;

            storyTotal += (x.nodes ?? 0) * STORY_NODE_LUNACY;
            storyClaimed += (state.nodes ?? 0) * STORY_NODE_LUNACY;

            storyTotal += (x.dungeons ?? 0) * STORY_DUNGEON_LUNACY;
            storyClaimed += (state.dungeons ?? 0) * STORY_DUNGEON_LUNACY;

            storyTotal += (x.sectionReward ?? STORY_SECTION_LUNACY) * 3 + STORY_COMPLETION_LUNACY;
            storyClaimed += (x.sectionReward ?? STORY_SECTION_LUNACY) * (state.sections ?? 0);
            if (state.sections === 3) storyClaimed += STORY_COMPLETION_LUNACY;
        });

        const storyRemain = storyTotal - storyClaimed;
        const storyStatus = storyTotal === 0 ? "excluded" : storyClaimed === storyTotal ? "claimed" : "unclaimed";

        let luxClaimed = 0;
        let luxTotal = 0;

        lunacyData.luxcavation.forEach(x => {
            const state = { count: 0, ...(userState[x.id] ?? {}) };
            if (state.excluded) return;

            luxTotal += (x.count ?? 0) * LUXCAVATION_LUNACY;
            luxClaimed += (state.count ?? 0) * LUXCAVATION_LUNACY;
        });

        const luxRemain = luxTotal - luxClaimed;
        const luxStatus = luxTotal === 0 ? "excluded" : luxClaimed === luxTotal ? "claimed" : "unclaimed";

        const getValueSection = section => {
            let claimed = 0;
            let total = 0;

            lunacyData[section].forEach(x => {
                const state = { claimed: false, ...(userState[x.id] ?? {}) };
                if (state.excluded) return;

                total += x.value;
                claimed += state.claimed ? x.value : 0;
            })

            const status = total === 0 ? "excluded" : claimed === total ? "claimed" : "unclaimed";
            return [total - claimed, status];
        }

        const [reflectrialRemain, reflectrialStatus] = getValueSection("reflectrial");
        const [eventRemain, eventStatus] = getValueSection("event");
        const [paidPassRemain, paidPassStatus] = getValueSection("paidPass");

        const total = current + other + recurringTotal + storyRemain + luxRemain + reflectrialRemain + eventRemain + paidPassRemain;

        return {
            total,
            recurringTotal, weeks, days,
            storyRemain, storyStatus,
            luxRemain, luxStatus,
            reflectrialRemain, reflectrialStatus,
            eventRemain, eventStatus,
            paidPassRemain, paidPassStatus
        };
    }, [lunacyData, lunacyDataLoading, current, other, userState, startDate, endDate, dailyRefresh, upties]);

    if (initializing || lunacyDataLoading) return <LoadingContentPageTemplate />;

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <PageHeader
            title={"Lunacy Calculator"}
            mainDesc={"Calculate your projected Lunacy based on unclaimed rewards and recurring sources of income."}
            subDesc={<>
                This calculator helps you estimate how much Lunacy you&apos;re projected to have by a selected date, based on recurring sources like the weekly Mirror Dungeon and maintenance rewards and one-time rewards like story and luxcavation rewards.
                <br /> <br />
                Each section or item for one-time rewards can be marked as claimed, unclaimed, or excluded, so you adjust the exact amount of Lunacy you can still obtain. For recurring sources, you can set the start and end date, and it will automatically calculate your expected income. You can also set your daily refreshes to automatically deduct Lunacy from your total.
            </>}
            wide={true}
            maxAds={1}
        />

        <div style={{ width: "100%", maxWidth: "800px" }}>
            <SummarySection computations={computations} current={current} setCurrent={setCurrent} other={other} setOther={setOther} />
        </div>

        <div style={{ width: "100%", maxWidth: "800px" }}>
            <RecurringSection
                startDate={startDate} endDate={endDate} dailyRefresh={dailyRefresh} upties={upties}
                total={computations.recurringTotal} weeks={computations.weeks} days={computations.days}
                setStartDate={setStartDate} setEndDate={setEndDate} setDailyRefresh={setDailyRefresh} setUpties={setUpties}
            />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center", maxWidth: "100vw" }}>
            <StorySection lunacyData={lunacyData} remain={computations.storyRemain} status={computations.storyStatus}
                userState={userState} setUserState={setUserState} />

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "stretch", flex: 1, maxWidth: "600px" }}>
                <LuxcavationSection lunacyData={lunacyData} remain={computations.luxRemain} status={computations.luxStatus}
                    userState={userState} setUserState={setUserState} />

                <ValueSection lunacyData={lunacyData} title={"Reflectrial"} section={"reflectrial"}
                    remain={computations.reflectrialRemain} status={computations.reflectrialStatus} userState={userState} setUserState={setUserState} />

                <ValueSection lunacyData={lunacyData} title={"Ongoing Event"} itemLabel={"Event"} section={"event"}
                    remain={computations.eventRemain} status={computations.eventStatus} userState={userState} setUserState={setUserState} />

                <ValueSection lunacyData={lunacyData} title={"Paid Battle Pass"} itemLabel={"Pass Level"} section={"paidPass"}
                    remain={computations.paidPassRemain} status={computations.paidPassStatus} userState={userState} setUserState={setUserState} />
            </div>
        </div>
    </div>;
}
