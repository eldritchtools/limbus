"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useRef, useState } from "react";

import SelectedTable from "./SelectedTable";
import { useData } from "../components/DataProvider";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import AllIdEgoSelector from "../components/selectors/AllIdEgoSelector";
import { getLocalStore } from "../database/localDB";
import { LEVEL_CAP } from "../lib/constants";
import { getLevelCost, getUptieCost, mdCrates, threadLux, xpLux } from "../lib/training";


export default function TrainingCalcPage() {
    const [identities, identitiesLoading] = useData("identities_mini");
    const [egos, egosLoading] = useData("egos_mini");

    const [selected, setSelected] = useState([]);
    const [starts, setStarts] = useState({ default: { level: 1, uptie: 0 } });
    const [targets, setTargets] = useState({ default: { level: LEVEL_CAP, uptie: "unowned" } });

    const [xLux, setXLux] = useState(Object.keys(xpLux).at(-1));
    const [xSkip, setXSkip] = useState(false);
    const [tLux, setTLux] = useState(Object.keys(threadLux).at(-1));
    const [tSkip, setTSkip] = useState(false);
    const [tBonus, setTBonus] = useState(false);
    const [md, setMd] = useState(Object.keys(mdCrates).at(-1));
    const [pass, setPass] = useState(false);

    const [initializing, setInitializing] = useState(true);
    const saveTimeout = useRef(null);
    const { isMobile } = useBreakpoint();

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
        }

        getLocalStore("trainingCalc").get("main").then(handleData);
    }, [initializing]);

    useEffect(() => {
        if (initializing) return;

        const saveData = async () => {
            const data = {
                id: "main",
                selected, starts, targets,
                xLux, xSkip, tLux, tSkip, tBonus, md, pass
            }

            await getLocalStore("trainingCalc").save(data);
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
    }, [initializing, selected, starts, targets, xLux, xSkip, tLux, tSkip, tBonus, md, pass]);

    const selectItem = id => {
        setSelected(p => [...p, id]);
        setStarts(p => ({ ...p, [id]: {} }));
        setTargets(p => ({ ...p, [id]: {} }));
    }

    const totalComponent = () => {
        let xp = 0;
        let thread = 0;
        let shard = 0;

        selected.forEach(id => {
            if (`${id}`[0] === "1") {
                let startLevel = starts[id].level ?? starts.default.level;
                let targetLevel = targets[id].level ?? targets.default.level;
                xp += getLevelCost(startLevel, targetLevel)

                let startUptie = starts[id].uptie ?? starts.default.uptie;
                if (startUptie === "unowned") startUptie = 0;

                const [t, s] = getUptieCost('0'.repeat(identities[id].rank), startUptie, targets[id].uptie ?? targets.default.uptie);

                thread += t;
                shard += s;
            } else {
                let startUptie = starts[id].uptie ?? starts.default.uptie;
                if (startUptie === "unowned") startUptie = 0;
                const [t, s] = getUptieCost(egos[id].rank, startUptie, targets[id].uptie ?? targets.default.uptie);

                thread += t;
                shard += s;
            }
        });

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
            <div style={{ display: "grid", gridTemplateColumns: "auto auto auto", gap: "0.5rem" }}>
                <span style={{ textAlign: "center" }}>Cost</span>
                <span style={{ textAlign: "center" }}>Source</span>
                <span style={{ textAlign: "center" }}>Runs</span>

                <span>XP: {xp}</span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <select value={xLux} onChange={e => setXLux(e.target.value)}>
                        {Object.entries(xpLux).map(([k, v]) => <option key={k} value={k}>Lvl {v[0]}</option>)}
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
                        {Object.keys(threadLux).map(k => <option key={k} value={k}>Lvl {k}</option>)}
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
                    <span>Shards per MD: {Math.round(shardsPerRun * 100)/100}</span>
                    <span>Runs: {shardRuns}</span>
                    <span>Modules: {shardModules}</span>
                </div>
            </div>
        </div>;
    }

    if (identitiesLoading || egosLoading) return <LoadingContentPageTemplate />;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <h3 style={{ margin: 0 }}>Dispenser and Training Calculator</h3>
        <span style={{ maxWidth: "1000px", textAlign: "center" }}>Compute how many tickets, threads, and shards you need to dispense, level, and uptie everything needed.<br/>Note that the number of runs may not be exact due to excess xp when using training tickets or the randomness of shards from crates.</span>

        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "1rem", alignItems: "center" }}>
            <SelectedTable
                identities={identities} egos={egos}
                selected={selected} setSelected={setSelected}
                starts={starts} setStarts={setStarts}
                targets={targets} setTargets={setTargets}
            />
            {totalComponent()}
        </div>

        <h4 style={{ margin: 0 }}>Choose Identities or E.G.Os</h4>
        <AllIdEgoSelector
            identityIds={selected.filter(x => `${x}`[0] === "1")}
            egoIds={selected.filter(x => `${x}`[0] === "2")}
            setIdentityId={selectItem}
            setEgoId={selectItem}
            identityOptions={identities}
            egoOptions={egos}
        />
    </div>;
}
