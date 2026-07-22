"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useRef, useState } from "react";

import LuxTable from "./LuxTable";
import SelectedTable from "./SelectedTable";
import { useData } from "../components/DataProvider";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import AllIdEgoSelector from "../components/selectors/AllIdEgoSelector";
import { getLocalStore } from "../database/localDB";
import { LEVEL_CAP } from "../lib/constants";
import { triggerToolUsedGAEvent } from "../lib/gaEvents";
import { getLevelCost, getUptieCost, mdCrates, threadLux, xpLux } from "../lib/training";

export default function TrainingCalcPage() {
    const [identities, identitiesLoading] = useData("identities");
    const [egos, egosLoading] = useData("egos");

    const [selected, setSelected] = useState([]);
    const [starts, setStarts] = useState({ default: { level: 1, uptie: "unowned" } });
    const [targets, setTargets] = useState({ default: { level: LEVEL_CAP, uptie: 5 } });

    const [xLux, setXLux] = useState(Object.keys(xpLux).at(-1));
    const [xSkip, setXSkip] = useState(false);
    const [tLux, setTLux] = useState(Object.keys(threadLux).at(-1));
    const [tSkip, setTSkip] = useState(false);
    const [tBonus, setTBonus] = useState(false);
    const [md, setMd] = useState(Object.keys(mdCrates).at(-1));
    const [pass, setPass] = useState(false);
    const [sc, setSC] = useState("shard");

    const [initializing, setInitializing] = useState(true);
    const saveTimeout = useRef(null);
    const { isMobile } = useBreakpoint();
    const [firstSave, setFirstSave] = useState(true);

    useEffect(() => {
        if (!initializing) return;
        const handleData = data => {
            setInitializing(false);
            if (!data) return;
            if (data.selected) setSelected(data.selected);
            if (data.starts) setStarts(data.starts);
            if (data.targets) setTargets(data.targets);
            if (data.xLux) setXLux(data.xLux);
            if (data.xSkip) setXSkip(data.xSkip);
            if (data.tLux) setTLux(data.tLux);
            if (data.tSkip) setTSkip(data.tSkip);
            if (data.tBonus) setTBonus(data.tBonus);
            if (data.md) setMd(data.md);
            if (data.pass) setPass(data.pass);
            if (data.sc) setSC(data.sc);
        }

        getLocalStore("trainingCalc").get("main").then(handleData);
    }, [initializing]);

    useEffect(() => {
        if (initializing) return;

        const saveData = async () => {
            const data = {
                id: "main",
                selected, starts, targets,
                xLux, xSkip, tLux, tSkip, tBonus, md, pass, sc
            }

            await getLocalStore("trainingCalc").save(data);

            if (firstSave) {
                triggerToolUsedGAEvent("Training Calculator");
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
    }, [initializing, selected, starts, targets, xLux, xSkip, tLux, tSkip, tBonus, md, pass, sc, firstSave]);

    const selectItem = id => {
        setSelected(p => [...p, id]);
        setStarts(p => ({ ...p, [id]: {} }));
        setTargets(p => ({ ...p, [id]: {} }));
    }

    const totalComponent = () => {
        let xp = 0;
        let thread = 0;
        let shard = 0;
        let spinchain = 0;

        selected.forEach(id => {
            if (`${id}`[0] === "1") {
                let startLevel = starts[id].level ?? starts.default.level;
                let targetLevel = targets[id].level ?? targets.default.level;
                xp += getLevelCost(startLevel, targetLevel)

                let startUptie = starts[id].uptie ?? starts.default.uptie;
                if (startUptie === "unowned") startUptie = 0;
                let uptie = Math.min(targets[id].uptie ?? targets.default.uptie, identities[id].maxThreadspin ?? 4);

                const [t, s, sc] = getUptieCost('0'.repeat(identities[id].rank), startUptie, uptie);

                thread += t;
                shard += s;
                spinchain += sc;
            } else {
                let startUptie = starts[id].uptie ?? starts.default.uptie;
                if (startUptie === "unowned") startUptie = 0;
                let uptie = Math.min(targets[id].uptie ?? targets.default.uptie, egos[id].maxThreadspin ?? 4);

                const [t, s, sc] = getUptieCost(egos[id].rank, startUptie, uptie);

                thread += t;
                shard += s;
                spinchain += sc;
            }
        });

        if (sc === "thread") {
            thread += spinchain * 2;
        } else if (sc === "nshard") {
            shard += spinchain * 2;
        } else {
            shard += spinchain;
        }

        const xpPerRun = xpLux[xLux][xSkip ? 2 : 1];
        const xpRuns = Math.ceil(xp / xpPerRun);
        const xpModules = xLux <= 3 ? xpRuns * (xSkip ? 4 : 2) : xpRuns * (xSkip ? 6 : 3);
        const threadPerRun = threadLux[tLux][0 + (tSkip ? 1 : 0) + (tBonus ? 2 : 0)];
        const threadRuns = Math.ceil(thread / threadPerRun);
        const threadModules = threadRuns * (tSkip ? 4 : 2);
        const shardsPerRun = 2 * mdCrates[md][0] * (pass ? 3 : 1);
        const shardRuns = Math.ceil(shard / shardsPerRun);
        const shardModules = shardRuns * mdCrates[md][1];

        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h3 style={{ margin: 0, textAlign: "center" }}>Totals:</h3>
            <div style={{ display: "grid", gridTemplateColumns: "auto auto auto", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ textAlign: "center" }}>Cost</span>
                <span style={{ textAlign: "center" }}>Source</span>
                <span style={{ textAlign: "center" }}>Runs</span>

                <span>XP: {xp}</span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <select value={xLux} onChange={e => setXLux(e.target.value)}>
                        {Object.entries(xpLux).map(([k, v]) => <option key={k} value={k}>Lvl {v[0]} XP Lux</option>)}
                    </select>
                    <label>
                        <input type="checkbox" checked={xSkip} onChange={e => setXSkip(e.target.checked)} />
                        <span>Skip?</span>
                    </label>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>XP per Lux: {xpPerRun}</span>
                    <span>Runs: {xpRuns}</span>
                    <span>Modules: {xpModules}</span>
                </div>
                <span>Thread: {thread}</span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <select value={tLux} onChange={e => setTLux(e.target.value)}>
                        {Object.keys(threadLux).map(k => <option key={k} value={k}>Lvl {k} Thread Lux</option>)}
                    </select>
                    <label>
                        <input type="checkbox" checked={tSkip} onChange={e => setTSkip(e.target.checked)} />
                        <span>Skip?</span>
                    </label>
                    <label>
                        <input type="checkbox" checked={tBonus} onChange={e => setTBonus(e.target.checked)} />
                        <span>Daily Bonus?</span>
                    </label>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>Thread per Lux: {threadPerRun}</span>
                    <span>Runs: {threadRuns}</span>
                    <span>Modules: {threadModules}</span>
                </div>
                <span>Shards: {shard}</span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <select value={md} onChange={e => setMd(e.target.value)}>
                        {Object.keys(mdCrates).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <label>
                        <input type="checkbox" checked={pass} onChange={e => setPass(e.target.checked)} />
                        <span>Pass Bought?</span>
                    </label>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>Shards per MD: {Math.round(shardsPerRun * 100) / 100}</span>
                    <span>Runs: {shardRuns}</span>
                    <span>Modules: {shardModules}</span>
                </div>
                <span>Spinchains: {spinchain}</span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <select value={sc} onChange={e => setSC(e.target.value)}>
                        <option value={"shard"}>Sinner Shard</option>
                        <option value={"nshard"}>Non-Sinner Shard</option>
                        <option value={"ushard"}>Uptie/TS-only Shard</option>
                        <option value={"thread"}>Thread</option>
                    </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {sc === "thread" ?
                        <span>Threads per Spinchain: 2</span> :
                        <span>Shards per Spinchain: {sc === "nshard" ? 2 : 1}</span>
                    }
                </div>
            </div>
        </div>;
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Dispense and Training Calculator</h1>
        <p style={{ margin: 0 }}>
            Calculate the total tickets, threads, and shards required to dispense, level, and uptie selected Identities and E.G.Os.
        </p>
        <p className="sub-text" style={{ margin: 0 }}>
            Results may vary slightly due to excess experience when overcapping from training tickets and the randomness of shards from crate rewards.
        </p>

        {identitiesLoading || egosLoading ?
            <LoadingContentPageTemplate /> :
            <>
                <div style={{
                    display: "flex", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row", gap: "1rem",
                    alignItems: "center", justifyContent: isMobile ? null : "center", maxWidth: "100%"
                }}>
                    <SelectedTable
                        identities={identities} egos={egos}
                        selected={selected} setSelected={setSelected}
                        starts={starts} setStarts={setStarts}
                        targets={targets} setTargets={setTargets}
                    />
                    {totalComponent()}
                </div>

                <h3 style={{ margin: 0 }}>Choose Identities or E.G.Os</h3>
                <AllIdEgoSelector
                    identityIds={selected.filter(x => `${x}`[0] === "1")}
                    egoIds={selected.filter(x => `${x}`[0] === "2")}
                    setIdentityId={selectItem}
                    setEgoId={selectItem}
                    identityOptions={identities}
                    egoOptions={egos}
                />

            </>}

        <LuxTable />
    </div>;
}
