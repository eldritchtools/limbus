"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useMemo, useRef, useState } from "react";

import styles from "./Banner.module.css";
import ResultsChart from "./ResultsChart";
import { useEgosWithUpcoming, useIdentitiesWithUpcoming } from "../components/dataHooks/upcoming";
import { useData } from "../components/DataProvider";
import BannerIcon from "../components/icons/BannerIcon";
import EgoIcon from "../components/icons/EgoIcon";
import IdentityIcon from "../components/icons/IdentityIcon";
import DropdownButton from "../components/objects/DropdownButton";
import NumberInput from "../components/objects/NumberInput";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { EgoDropdownSelector } from "../components/selectors/EgoSelectors";
import { IdentityDropdownSelector } from "../components/selectors/IdentitySelectors";
import { useAuth } from "../database/authProvider";
import { getCompany } from "../database/companies";
import { getLocalStore } from "../database/localDB";
import { bitsetFunctions } from "../lib/bitset";
import { triggerToolUsedGAEvent } from "../lib/gaEvents";

let modes = {
    "all": "All",
    "ids": "000s",
    "egos": "E.G.Os",
    "announcers": "Announcers"
}

const bannerStyle = (isMobile) => isMobile ?
    { width: "170px", height: "75px" } :
    { width: "280px", height: "120px" };

const iconStyle = (isMobile) => isMobile ?
    { width: "96px", height: "96px" } :
    { width: "128px", height: "128px" };

function CustomBanner({ identityIds, setIdentityIds, egoIds, setEgoIds, announcers, setAnnouncers, selected, setSelected }) {
    return <div
        className={`${styles.banner} ${selected ? styles.selected : ""}`}
        style={{ alignItems: "center", maxWidth: "min(400px, 90vw)" }}
        onClick={() => setSelected({ name: "custom" })}
    >
        <span style={{ textAlign: "center" }}>Custom Banner</span>
        <div style={{ display: "flex", flexDirection: "column", alignSelf: "start", maxWidth: "min(350px, 85vw)" }}>
            <span>Identities</span>
            <IdentityDropdownSelector selected={identityIds} setSelected={setIdentityIds} isMulti={true} />
            <span>E.G.Os</span>
            <EgoDropdownSelector selected={egoIds} setSelected={setEgoIds} isMulti={true} />
        </div>
    </div>
}

function Banner({ banner, identities, egos, isMobile, selected, setSelected }) {
    const items = { 3: [], 2: [], 1: [], "ego": [], "announcer": [], "offAnnouncer": [] };
    let isWalpurgis = false;
    Object.entries(banner.bannerConds).forEach(([k, v]) => {
        switch (k) {
            case "ids":
                v.forEach(x => {
                    if (x[0] === "1") items[identities[x].rank].push(x);
                    else items["ego"].push(x);
                })
                break;
            case "sinnerId":
                const insertItem = (isIdentity, id, obj) => {
                    if (obj.sinnerId !== v || obj.season >= 8000 || obj.upcoming) return;
                    if (isIdentity) items[obj.rank].push(id);
                    else {
                        if (egos[id].extractable) items["ego"].push(id);
                    }
                }
                Object.entries(identities).forEach(([id, obj]) => insertItem(true, id, obj));
                Object.entries(egos).forEach(([id, obj]) => insertItem(false, id, obj));
                break;
            case "announcers":
                items["announcer"].push(v);
                break;
            case "walpurgis":
                if (v) isWalpurgis = true;
                break;
            default:
                break;
        }
    })

    const labels = [];
    const toLabel = (k, id) => {
        if (String(k) === "3") return `[000] ${identities[id].name}`;
        if (String(k) === "2") return `[00] ${identities[id].name}`;
        if (String(k) === "1") return `[0] ${identities[id].name}`;
        if (k === "ego") return `[${egos[id].rank}] ${egos[id].name}`;
        if (k === "announcer") return `[Announcer] ${id}`;
        return "";
    }

    Object.entries(items).forEach(([k, list]) => list.forEach(x => labels.push(toLabel(k, x))));

    return <div
        className={`${styles.banner} ${selected ? styles.selected : ""}`}
        style={{ alignItems: "center" }}
        onClick={() => setSelected({ name: banner.name, items: items, isWalpurgis: isWalpurgis })}
    >
        <span style={{ textAlign: "center" }}>{banner.name}</span>
        {banner.src && <BannerIcon path={banner.src} style={bannerStyle(isMobile)} />}
        <div style={{ display: "flex", flexDirection: "column", alignSelf: "start" }}>
            {labels.map((x, i) => <span key={i}>{x}</span>)}
        </div>
    </div>
}

export default function ExtractionSimulatorPage() {
    const [timers, timersLoading] = useData("timers");
    const [identities, identitiesLoading] = useIdentitiesWithUpcoming(true);
    const [egos, egosLoading] = useEgosWithUpcoming(true);
    const [firstSimulation, setFirstSimulation] = useState(true);

    const [selected, setSelected] = useState(null);
    const [pulled, setPulled] = useState([]);

    const [isWalpurgis, setIsWalpurgis] = useState(false);
    const [extractedEgos, setExtractedEgos] = useState(new Set());

    const [customIdentityIds, setCustomIdentityIds] = useState([]);
    const [customEgoIds, setCustomEgoIds] = useState([]);
    const [customAnnouncers, setCustomAnnouncers] = useState([]);

    const [pullCount, setPullCount] = useState(0);
    const [companyLoading, setCompanyLoading] = useState(0);

    const [maxPulls, setMaxPulls] = useState(200);
    const [calculateMode, setCalculateMode] = useState("all");
    const [calculatedMode, setCalculatedMode] = useState(null);
    const [calculatedBanner, setCalculatedBanner] = useState(null);
    const [calculateResults, setCalculateResults] = useState([]);
    const [calculating, setCalculating] = useState(false);
    const workerRef = useRef();

    const { isMobile } = useBreakpoint();
    const { user } = useAuth();

    const [ids3, ids2, ids1] = useMemo(() => {
        if (identitiesLoading) return [[], [], []];
        const ids3 = [], ids2 = [], ids1 = [];
        Object.entries(identities).forEach(([id, obj]) => {
            if (obj.upcoming) return;
            if (!(isWalpurgis || selected?.isWalpurgis) && obj.season >= 9100) return;
            if (obj.rank === 3) ids3.push(id);
            else if (obj.rank === 2) ids2.push(id);
            else if (obj.rank === 1) ids1.push(id);
        });
        return [ids3, ids2, ids1];
    }, [identities, identitiesLoading, isWalpurgis, selected]);

    const extractableEgos = useMemo(() => {
        if (egosLoading) return [];
        const result = [];
        Object.entries(egos).forEach(([id, obj]) => {
            if (obj.upcoming) return;
            if (!(isWalpurgis || selected?.isWalpurgis) && obj.season >= 9100) return;
            if (obj.season >= 8000 && obj.season <= 9000) return;
            if (!obj.extractable) return;
            if (extractedEgos.has(id)) return;
            result.push(id);
        });
        return result;
    }, [egos, egosLoading, isWalpurgis, extractedEgos, selected])

    const extractableEgoComponents = useMemo(() => {
        if (egosLoading) return [];
        const ids = [];

        Object.entries(egos).forEach(([id, ego]) => {
            if (ego.season >= 9100) {
                if ((selected?.isWalpurgis) || isWalpurgis) ids.push(id);
                return;
            }
            if (ego.season >= 8000) return;
            if (ego.extractable) ids.push(id);
        })

        if (selected) {
            (selected.name === "custom" ? customEgoIds : selected.items.ego).forEach(id => {
                if (!ids.includes(id)) ids.push(id);
            });
        }

        ids.sort();

        return ids.map(id =>
            <div key={id}
                style={{
                    ...iconStyle(isMobile),
                    filter: extractedEgos.has(id) ? "brightness(0.5)" : null
                }}
                onClick={() => {
                    const newSet = new Set([...extractedEgos]);
                    if (extractedEgos.has(id)) newSet.delete(id);
                    else newSet.add(id);
                    setExtractedEgos(newSet);
                }}
            >
                <EgoIcon ego={egos[id]} type={"awaken"} displayRarity={true} displayName={true} />
            </div>
        );
    }, [egos, egosLoading, extractedEgos, isWalpurgis, isMobile, selected, customEgoIds])

    const pulledComponents = useMemo(() => {
        if (pulled.length === 0) return [];

        const constructPulledComponent = (i, id) => {
            let comp;
            if (id[0] === '1') comp = <IdentityIcon id={id} uptie={4} displayRarity={true} displayName={true} />
            else if (id[0] === '2') comp = <EgoIcon id={id} type={"awaken"} displayRarity={true} displayName={true} />
            else comp = `Announcer: ${id}`

            return <div key={`${pullCount}-${i}`} style={iconStyle(isMobile)}>
                {comp}
            </div>
        }

        if (pulled.length === 1) return [constructPulledComponent(0, pulled[0])];

        if (isMobile)
            return [
                <div key={"l1"} style={{ display: "flex", gap: "0.5rem" }}>
                    {pulled.slice(0, 3).map((x, i) => constructPulledComponent(i, x))}
                </div>,
                <div key={"l2"} style={{ display: "flex", gap: "0.5rem" }}>
                    {pulled.slice(3, 6).map((x, i) => constructPulledComponent(i + 3, x))}
                </div>,
                <div key={"l3"} style={{ display: "flex", gap: "0.5rem" }}>
                    {pulled.slice(6, 9).map((x, i) => constructPulledComponent(i + 6, x))}
                </div>,
                <div key={"l4"} style={{ display: "flex", gap: "0.5rem" }}>
                    {pulled.slice(9, 10).map((x, i) => constructPulledComponent(i + 9, x))}
                </div>,
            ];

        return [
            <div key={"l1"} style={{ display: "flex", gap: "0.5rem" }}>
                {pulled.slice(0, 5).map((x, i) => constructPulledComponent(i, x))}
            </div>,
            <div key={"l2"} style={{ display: "flex", gap: "0.5rem" }}>
                {pulled.slice(5, 10).map((x, i) => constructPulledComponent(i + 5, x))}
            </div>
        ]
    }, [pulled, pullCount, isMobile]);

    const pickRandom = list => {
        const rnd = Math.floor(Math.random() * list.length);
        return list[rnd];
    }

    const executePull = count => {
        if (!selected) return;
        if (firstSimulation) {
            triggerToolUsedGAEvent("Extraction Simulator");
            setFirstSimulation(false);
        }
        setPullCount(p => p + 1);
        const extractableEgosTemp = new Set([...extractableEgos]);

        const items = selected.name === "custom" ? {
            3: customIdentityIds.filter(id => identities[id].rank === 3),
            2: customIdentityIds.filter(id => identities[id].rank === 2),
            1: customIdentityIds.filter(id => identities[id].rank === 1),
            "ego": [...customEgoIds],
            "announcer": [],
            "offAnnouncer": []
        } : selected.items;

        console.log(items);
        items.ego.forEach(x => extractableEgosTemp.add(x));

        const executeSinglePull = (noBase) => {
            let rnd = Math.random() * 100;
            if (items.announcer.length > 0) {
                if (rnd < 1.3) return pickRandom(items.announcer);
                rnd -= 1.3;
            }
            let prob3 = 2.9, prob2 = 12.8;
            if (extractableEgosTemp.size > 0) {
                if (rnd < 1.3) {
                    if (items.ego.length > 0 && items.ego.some(x => extractableEgosTemp.has(x)) && Math.random() < 0.5) {
                        const ego = pickRandom(items.ego.filter(x => extractableEgosTemp.has(x)))
                        extractableEgosTemp.delete(ego);
                        return ego;
                    } else {
                        const ego = pickRandom([...extractableEgosTemp].filter(x => !items.ego.includes(x)))
                        extractableEgosTemp.delete(ego);
                        return ego;
                    }
                }
                rnd -= 1.3;
            } else {
                prob3 = 3, prob2 = 13;
            }

            if (rnd < prob3) {
                if (items[3].length > 0 && Math.random() < 0.5) {
                    return pickRandom(items[3]);
                } else {
                    return pickRandom(ids3.filter(x => !items[3].includes(x)));
                }
            }
            rnd -= prob3;

            if (noBase || rnd < prob2) {
                if (items[2].length > 0 && Math.random() < 0.5) {
                    return pickRandom(items[2]);
                } else {
                    return pickRandom(ids2.filter(x => !items[2].includes(x)));
                }
            }

            if (items[1].length > 0 && Math.random() < 0.5) {
                return pickRandom(items[1]);
            } else {
                return pickRandom(ids1.filter(x => !items[1].includes(x)));
            }
        }

        if (count === 1) {
            setPulled([executeSinglePull(false)]);
            return;
        }

        const result = [];
        for (let i = 0; i < 9; i++) result.push(executeSinglePull(false));
        result.push(executeSinglePull(true));
        setPulled(result);
    }

    const applyCompanyData = () => {
        if (egosLoading || companyLoading) return;
        setCompanyLoading(true);

        const handleCompany = company => {
            if (!company) return;
            const newValues = new Set();
            const idMasks = company.egos.map(mask => bitsetFunctions.fromString(mask));
            Object.entries(egos).forEach(([id, ego]) => {
                if (!bitsetFunctions.hasFlag(idMasks[ego.sinnerId - 1], Number(id.slice(-2)) - 1)) return;
                newValues.add(id);
            });

            setExtractedEgos(newValues);
            setCompanyLoading(false);
        }

        if (user) {
            getCompany(user).then(handleCompany);
        } else {
            getLocalStore("companies").get("main").then(handleCompany);
        }
    }

    const triggerSolver = () => {
        if (!selected) return;
        if (calculating) {
            if (!workerRef.current) return;

            workerRef.current.postMessage({ command: "cancel" });
        } else {
            setCalculateResults([]);
            setCalculating(true);
            setCalculatedMode(calculateMode);
            setCalculatedBanner(selected.name);

            const worker = new Worker(new URL("./calculator.js", import.meta.url));
            workerRef.current = worker;

            worker.onmessage = (e) => {
                const { type, results: chunk } = e.data;

                if (type === "results") {
                    setCalculateResults(prev => [...prev, ...chunk]);
                }

                if (type === "done") {
                    setCalculating(false);
                    worker.terminate();
                    workerRef.current = null;
                }
            };

            const items = selected.name === "custom" ? {
                3: customIdentityIds.filter(id => identities[id].rank === 3),
                "ego": [...customEgoIds],
                "announcer": [],
                "offAnnouncer": []
            } : selected.items;

            worker.postMessage({
                command: "start",
                params: {
                    maxPulls,
                    countId: calculateMode === "ids" || calculateMode === "all" ? items[3].length : 0,
                    countEgo: calculateMode === "egos" || calculateMode === "all" ? items.ego.length : 0,
                    countAnnouncer: calculateMode === "announcers" || calculateMode === "all" ? items.announcer.length : 0,
                    offBannerAnnouncers: items.offAnnouncer.length > 0,
                    announcersInBanner: items.announcer.length > 0 || items.offAnnouncer.length > 0,
                    computeAll: calculateMode === "all"
                }
            });
        }
    }

    if (timersLoading || identitiesLoading || egosLoading) return <LoadingContentPageTemplate />

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Extraction Simulator</h1>
        <span style={{ maxWidth: "1000px", textAlign: "start" }}>
            Choose or create a banner and simulate extractions.
        </span>
        <span className="sub-text">
            There may be some inaccuracies due to possible differences between how the randomization is implemented.
        </span>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.25rem", maxWidth: "min(1600px, 100vw)" }}>
            <div className="panel-container">
                <h3 style={{ margin: 0, textAlign: "center" }}>Banner Selection</h3>
                <div style={{ overflowY: "auto", overflowX: "hidden", maxHeight: "450px", minWidth: "300px" }}>
                    <CustomBanner
                        identityIds={customIdentityIds} setIdentityIds={setCustomIdentityIds}
                        egoIds={customEgoIds} setEgoIds={setCustomEgoIds}
                        announcers={customAnnouncers} setAnnouncers={setCustomAnnouncers}
                        selected={selected?.name === "custom"} setSelected={setSelected}
                    />
                    <Banner banner={timers.banners.main}
                        identities={identities} egos={egos}
                        isMobile={isMobile} selected={selected?.name === timers.banners.main.name} setSelected={setSelected}
                    />
                    {
                        timers.banners.others.map((banner, i) =>
                            <Banner key={i} banner={banner}
                                identities={identities} egos={egos}
                                isMobile={isMobile} selected={selected?.name === banner.name} setSelected={setSelected}
                            />
                        )
                    }
                </div>
            </div>

            <div className="panel-container" style={{ gap: "0.2rem", alignItems: "center", }}>
                <h3 style={{ margin: 0, textAlign: "center" }}>Pulls</h3>
                <div style={{
                    display: "flex", flexDirection: "column", gap: "0.5rem",
                    width: isMobile ? "300px" : "750px",
                    height: isMobile ? "420px" : "300px",
                    border: "1px var(--secondary-border-color) solid", borderRadius: "0.5rem",
                    alignItems: "center", justifyContent: "center"
                }}>
                    {selected ? pulledComponents : <span>Select a banner</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", justifyContent: "center" }}>
                    <label>
                        <input type="checkbox" checked={isWalpurgis || selected?.isWalpurgis} onChange={e => setIsWalpurgis(e.target.checked)} disabled={selected?.isWalpurgis} />
                        <span>Include Walpurgis</span>
                    </label>
                    <button onClick={() => executePull(1)}>Pull 1</button>
                    <button onClick={() => executePull(10)}>Pull 10</button>
                </div>
            </div>
        </div>

        <div className="panel-container" style={{ width: "100%", maxWidth: "min(1600px, 100vw)"}}>
            <h3 style={{ display: "flex", gap: "0.5rem", alignItems: "center", margin: 0 }}>
                Extractable E.G.Os
                <button onClick={applyCompanyData} disabled={companyLoading}>Apply Company Data</button>
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxHeight: "500px", overflowY: "auto", justifyContent: "center" }}>
                {extractableEgoComponents}
            </div>
        </div>

        <div className="panel-container" style={{ width: "100%", maxWidth: "min(1600px, 100vw)", gap: "0.5rem" }}>
            <h3 style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", margin: 0 }}>
                Probabilities Calculator
                <DropdownButton value={calculateMode} setValue={setCalculateMode} options={modes} />
                <div>
                    Pulls:
                    <NumberInput min={0} max={1000} value={maxPulls} onChange={setMaxPulls} style={{ width: "5ch" }} />
                </div>
                <button onClick={() => triggerSolver()} style={{ background: calculating ? "#dc3545" : "#1e7e34" }} disabled={!selected}>
                    {calculating ? "Cancel" : "Compute!"}
                </button>
            </h3>

            {calculatedMode &&
                <span>
                    {
                        calculatedMode === "all" ?
                            `Probability of getting all banner 000s, E.G.Os, and announcers from ${calculatedBanner}.` :
                            `Probability of getting at least n unique banner ${modes[calculatedMode]} from ${calculatedBanner}.`
                    }
                </span>
            }

            <ResultsChart
                data={calculateResults}
                calculateMode={calculatedMode}
            />

            <span className="sub-text">
                This computation assumes E.G.Os are still pullable. Pity from Idealty is not included in the results. Please note that increasing the number of pulls too much could cause the page to crash due to memory issues.
            </span>
        </div>
    </div>
}
