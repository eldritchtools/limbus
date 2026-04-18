"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./keywordSolver.module.css";
import BuildIdentitiesGrid from "../components/build/BuildIdentitiesGrid";
import { useData } from "../components/DataProvider";
import IdentityIcon from "../components/icons/IdentityIcon";
import KeywordIcon from "../components/icons/KeywordIcon";
import SinnerIcon from "../components/icons/SinnerIcon";
import NumberInput from "../components/objects/NumberInput";
import NumberInputWithButtons from "../components/objects/NumberInputWithButtons";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import AllIdEgoSelector from "../components/selectors/AllIdEgoSelector";
import { IdentityMenuSelector } from "../components/selectors/IdentitySelectors";
import { getLocalStore } from "../database/localDB";
import { uiColors } from "../lib/colors";
import { keywords } from "../lib/constants";

function ResultComponent({ identities, result, keywordTargets, router, isMobile }) {
    const counts = Object.fromEntries(keywords.slice(0, 7).map(kw => [kw, 0]));
    result.forEach(id => {
        if (!id) return;
        (identities[id].skillKeywordList ?? []).forEach(kw => counts[kw]++);
    });

    const copyToBuild = () => {
        const params = new URLSearchParams({ identityIds: result.join(",") });
        router.push(`/builds/new?${params.toString()}`)
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", border: "1px #aaa solid", borderRadius: "0.5rem", padding: "0.5rem", boxSizing: "border-box" }}>
        <BuildIdentitiesGrid identityIds={result} scale={isMobile ? .2 : .33} />
        <div style={{ display: "flex", gap: "0.2rem" }}>
            {Object.entries(counts).map(([kw, cnt], i) =>
                <div key={kw} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                    <KeywordIcon id={kw} />
                    <span style={{ fontWeight: "bold", color: keywordTargets[i] === 0 ? "#777" : uiColors.green }}>{cnt}</span>
                </div>)
            }

            <button onClick={() => copyToBuild()}>
                Create Build
            </button>
        </div>
    </div>
}

export default function KeywordSolverPage() {
    const [identities, identitiesLoading] = useData("identities_mini");
    const [fixedIdentityIds, setFixedIdentityIds] = useState(Array.from({ length: 12 }, () => null));
    const [enabledSinners, setEnabledSinners] = useState(Array.from({ length: 12 }, () => true));
    const [deployedSinners, setDeployedSinners] = useState(7);
    const [keywordTargets, setKeywordTargets] = useState(Array.from({ length: 7 }, () => 0));
    const [solvers, setSolvers] = useState(5);

    const [wbMode, setWbMode] = useState("b");
    const [wbList, setWbList] = useState([]);
    const [wbListDisplay, setWbListDisplay] = useState("mixed");
    const [wbListOpen, setWbListOpen] = useState(false);

    const [initializing, setInitializing] = useState(true);
    const [solving, setSolving] = useState(false);
    const [executed, setExecuted] = useState(false);
    const [results, setResults] = useState([]);
    const workerRef = useRef(null);
    const saveTimeout = useRef(null);
    const { isMobile } = useBreakpoint();
    const router = useRouter();

    useEffect(() => {
        if (!initializing) return;
        const handleData = data => {
            setInitializing(false);
            if (!data) return;
            if (data.fixedIdentityIds) setFixedIdentityIds(data.fixedIdentityIds);
            if (data.enabledSinners) setEnabledSinners(data.enabledSinners);
            if (data.deployedSinners) setDeployedSinners(data.deployedSinners);
            if (data.keywordTargets) setKeywordTargets(data.keywordTargets);
            if (data.solvers) setSolvers(data.solvers);
            if (data.wbMode) setWbMode(data.wbMode);
            if (data.wbList) setWbList(data.wbList);
            if (data.wbListDisplay) setWbListDisplay(data.wbListDisplay);
            if (data.wbListOpen) setWbListOpen(data.wbListOpen);
        }

        getLocalStore("keywordSolver").get("main").then(handleData);
    }, [initializing]);

    useEffect(() => {
        if (initializing) return;

        const saveData = async () => {
            const data = {
                id: "main",
                fixedIdentityIds, enabledSinners,
                deployedSinners, keywordTargets, solvers,
                wbMode, wbList, wbListDisplay, wbListOpen
            }

            await getLocalStore("keywordSolver").save(data);
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
    }, [initializing, fixedIdentityIds, enabledSinners, deployedSinners, keywordTargets, solvers, wbMode, wbList, wbListDisplay, wbListOpen]);

    const handleSetFixedIdentityId = (index, id) => {
        setFixedIdentityIds(p => p.map((v, i) => i === index ? id : v));
    }

    const toggleSinnerEnabled = index => {
        setEnabledSinners(p => p.map((v, i) => i === index ? !v : v));
    }

    const resetSinners = () => {
        setFixedIdentityIds(Array.from({ length: 12 }, () => null));
        setEnabledSinners(Array.from({ length: 12 }, () => true));
    }

    const triggerSolver = () => {
        if (solving) {
            if (!workerRef.current) return;

            workerRef.current.postMessage({ command: "cancel" });
        } else {
            setResults([]);
            setSolving(true);
            setExecuted(true);

            const worker = new Worker(new URL("./solver.js", import.meta.url));
            workerRef.current = worker;

            worker.onmessage = (e) => {
                const { type, result: result } = e.data;

                if (type === "result") {
                    const converted = result.reduce((acc, id) => {
                        acc[identities[id].sinnerId - 1] = id;
                        return acc;
                    }, Array.from({ length: 12 }, () => null));

                    setResults(prev => [...prev, converted]);
                }

                if (type === "done") {
                    setSolving(false);
                    worker.terminate();
                    workerRef.current = null;
                }
            };

            const params = {
                identityOptions:
                    wbListOpen ?
                        (wbMode === "w" ?
                            wbList.map(id => identities[id]) :
                            Object.values(identities).filter(x => !wbList.includes(x.id))
                        ) :
                        Object.values(identities),
                fixedIdentityIds:
                    fixedIdentityIds.reduce((acc, id, i) => {
                        if (!id) return acc;
                        acc[i + 1] = id;
                        return acc;
                    }, {}),
                enabledSinnerIds:
                    enabledSinners.map((enabled, i) => enabled ? i + 1 : null).filter(x => x),
                deployedSinners: deployedSinners,
                keywordTargets:
                    keywordTargets.reduce((acc, cnt, i) => {
                        if (cnt === 0) return acc;
                        acc[keywords[i]] = cnt;
                        return acc;
                    }, {}),
                solvers: solvers
            };

            worker.postMessage({
                command: "start",
                params: { ...params }
            });
        }
    }

    const wbListComponent = useMemo(() => {
        if (identitiesLoading) return null;

        const component = (id, i) => {
            return <div key={i} className={styles.wbComponent} onClick={() => setWbList(p => p.filter(x => x !== id))}>
                <IdentityIcon id={id} uptie={4} displayName={true} displayRarity={true} />
            </div>
        }

        if (wbListDisplay === "mixed")
            return <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem" }}>
                {wbList.map((x, i) => component(x, i))}
            </div>

        const bySinner = {};
        wbList.forEach(x => {
            let sinnerId = identities[x].sinnerId;
            if (sinnerId in bySinner) bySinner[sinnerId].push(x);
            else bySinner[sinnerId] = [x];
        })

        return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            {Object.entries(bySinner).map(([sinnerId, list]) => <div key={sinnerId} style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <SinnerIcon num={sinnerId} style={{ width: "48px", height: "48px" }} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem" }}>
                    {list.map((x, i) => component(x, i))}
                </div>
            </div>)}
        </div>;
    }, [wbList, wbListDisplay, identities, identitiesLoading]);

    const identityOptions = useMemo(() => {
        if (identitiesLoading) return [];
        return Object.entries(identities).reverse().reduce((acc, [_, identity]) => {
            acc[identity.sinnerId].push(identity); return acc;
        }, Object.fromEntries(Array.from({ length: 12 }, (_, index) => [index + 1, []])));
    }, [identities, identitiesLoading]);

    if (identitiesLoading || initializing) return <LoadingContentPageTemplate />;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <h3 style={{ margin: 0 }}>Keyword Solver</h3>
        <span style={{ maxWidth: "1000px", textAlign: "center" }}>This tool allows you to generate teams with enough deployed identities that include the set keywords. You can fix identities or prevent sinners from being used in the builder below. You can also blacklist or whitelist identities from being selected. When you are done, you can hit solve and let it find teams that fit the conditions provided! If you like a team, Create Build will send you to the create a Team Build page with that team. Any settings you change are saved locally, but solved teams are not saved.</span>

        <h4 style={{ margin: 0 }}>Solver Settings</h4>
        <span>Sinner Settings (fix or disable sinners)</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
            {Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                    filter: enabledSinners[i] ? "brightness(1)" : "brightness(0.5)",
                    width: isMobile ? "96px" : "128px", height: isMobile ? "96px" : "128px"
                }}>
                    <IdentityMenuSelector
                        value={identities[fixedIdentityIds[i]] || null}
                        setValue={v => handleSetFixedIdentityId(i, v)}
                        options={identityOptions[i + 1]}
                        num={i + 1}
                    />
                </div>
                <button onClick={() => toggleSinnerEnabled(i)}>
                    {enabledSinners[i] ? "Disable Sinner" : "Enable Sinner"}
                </button>
            </div>)}
        </div>

        <span>Solver Settings</span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                <span>Sinners per status</span>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                    {keywords.slice(0, 7).map((kw, i) => <div key={kw} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                        <KeywordIcon id={kw} />
                        <NumberInputWithButtons
                            value={keywordTargets[i]}
                            setValue={x => setKeywordTargets(p => p.map((v, ind) => ind === i ? x : v))}
                            min={0} max={12}
                            vertical={true}
                            inputStyle={{ width: "2ch" }}
                        />
                    </div>)}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span>Deployed Sinners:</span>
                    <NumberInput value={deployedSinners} onChange={setDeployedSinners} min={1} max={12} style={{ textAlign: "center", width: "3ch" }} />
                </div>
                <button onClick={() => setWbListOpen(p => !p)}>
                    Toggle Blacklist/Whitelist
                </button>
                <button onClick={() => resetSinners()}>
                    Reset sinner settings
                </button>
                <button onClick={() => setSolvers(solvers === 2 ? 5 : solvers === 5 ? 10 : 2)}>
                    Search Mode: {
                        solvers === 2 ? "Faster" :
                            solvers === 5 ? "Balanced" :
                                "Variety"
                    }
                </button>
                <button onClick={() => triggerSolver()} style={{ background: solving ? "#dc3545" : "#1e7e34" }}>
                    {solving ? "Cancel" : "Solve!"}
                </button>
            </div>
        </div>

        <span style={{ maxWidth: "1000px", textAlign: "center" }}>The tool can take quite a while to find solutions if the requirements are strict. The first few teams will be relatively fast if they exist, but the rest may take a while to be found. Try switching to the faster search mode if it takes a while. Variety increases variety of teams that will appear if there are a lot of them to avoid getting all the same builds with just 1-2 differing identities, but the results will always have some level of randomness to them.</span>

        {wbListOpen ? <>
            <div style={{ display: "flex", gap: "1rem", alignSelf: "start" }}>
                <span className={`tab-header ${wbMode === "b" ? "active" : null}`} onClick={() => setWbMode("b")}>Blacklist</span>
                <span className={`tab-header ${wbMode === "w" ? "active" : null}`} onClick={() => setWbMode("w")}>Whitelist</span>
                <span className={`tab-header`} onClick={() => setWbList([])}>Clear All</span>
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem", border: "1px #aaa solid", borderRadius: "1rem", padding: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span>Display:</span>
                    <span className={`tab-header ${wbListDisplay === "mixed" ? "active" : null}`} onClick={() => setWbListDisplay("mixed")}>Mixed</span>
                    <span className={`tab-header ${wbListDisplay === "sinner" ? "active" : null}`} onClick={() => setWbListDisplay("sinner")}>Per Sinner</span>
                </div>
                {wbListComponent}
            </div>
            <AllIdEgoSelector
                identityIds={wbList}
                setIdentityId={x => setWbList(p => [...p, x])}
                identityOptions={identities}
            />
        </> : null
        }

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem" }}>
            {results.map((result, i) =>
                <ResultComponent key={i} identities={identities} result={result} keywordTargets={keywordTargets} router={router} isMobile={isMobile} />
            )}
        </div>

        {executed ?
            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                {solving ?
                    "Searching for teams..." :
                    results.length === 0 ?
                        "No teams found" :
                        null
                }
            </span> :
            null
        }
    </div>;
}
