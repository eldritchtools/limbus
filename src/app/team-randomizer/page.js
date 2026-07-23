"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import BuildDisplayMenuCard from "../components/build/BuildDisplayMenuCard";
import { useData } from "../components/DataProvider";
import BuildEditingComponent from "../components/editors/BuildEditingComponent";
import NumberInput from "../components/objects/NumberInput";
import WbList, { useWbState } from "../components/objects/WbList";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { getLocalStore } from "../database/localDB";
import { egoRankMapping } from "../lib/constants";
import { triggerToolUsedGAEvent } from "../lib/gaEvents";
import { constructTeamCode } from "../lib/teamCodeEncoding";

export default function TeamRandomizerPage() {
    const [identities, identitiesLoading] = useData("identities");
    const [egos, egosLoading] = useData("egos");

    const [identityIds, setIdentityIds] = useState(Array.from({ length: 12 }, () => null));
    const [egoIds, setEgoIds] = useState(Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => null)));

    const [fixedIdentityIds, setFixedIdentityIds] = useState(Array.from({ length: 12 }, () => null));
    const [fixedEgoIds, setFixedEgoIds] = useState(Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => null)));

    const wbState = useWbState();
    const [wbListOpen, setWbListOpen] = useState(false);

    const [randomizeIdentities, setRandomizeIdentities] = useState(true);
    const [randomizeEgos, setRandomizeEgos] = useState(true);
    const [emptyEgoProb, setEmptyEgoProb] = useState(0);

    const [initializing, setInitializing] = useState(true);
    const saveTimeout = useRef(null);
    const router = useRouter();

    useEffect(() => {
        if (!initializing) return;
        const handleData = data => {
            setInitializing(false);
            if (!data) return;
            if (data.fixedIdentityIds) {
                setFixedIdentityIds(data.fixedIdentityIds);
                setIdentityIds(data.fixedIdentityIds);
            }
            if (data.fixedEgoIds) {
                setFixedEgoIds(data.fixedEgoIds);
                setEgoIds(data.fixedEgoIds);
            }

            if(data.wbState) {
                wbState.updateState(data.wbState);
            } else {
                const tempWbState = {};
                if (data.wbMode) tempWbState.mode = data.wbMode;
                if (data.wbList) tempWbState.list = data.wbList;
                if (data.wbListDisplay) tempWbState.listDisplay = data.wbListDisplay;
                if (Object.keys(tempWbState).length) wbState.updateState(tempWbState);
            }

            if (data.wbListOpen) setWbListOpen(data.wbListOpen);
            if (data.randomizeIdentities) setRandomizeIdentities(data.randomizeIdentities);
            if (data.randomizeEgos) setRandomizeEgos(data.randomizeEgos);
            if (data.emptyEgoProb) setEmptyEgoProb(data.emptyEgoProb);
        }

        getLocalStore("teamRandomizer").get("main").then(handleData);
    }, [initializing, wbState]);

    useEffect(() => {
        if (initializing) return;

        const saveData = async () => {
            const data = {
                id: "main",
                fixedIdentityIds, fixedEgoIds,
                wbState: wbState.getSavedState(), wbListOpen,
                randomizeIdentities, randomizeEgos, emptyEgoProb
            }

            await getLocalStore("teamRandomizer").save(data);
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
    }, [initializing, fixedIdentityIds, fixedEgoIds, wbState, wbListOpen, 
        randomizeIdentities, randomizeEgos, emptyEgoProb]);

    const handleSetFixedIdentityIds = newIdsFunc => {
        const newIds = newIdsFunc(identityIds);
        const di = newIds.findIndex((v, i) => v !== identityIds[i]);
        setFixedIdentityIds(p => p.map((v, i) => i === di ? newIds[di] : v));
        setIdentityIds(newIds);
    }

    const handleSetFixedEgoIds = newIdsFunc => {
        const newIds = newIdsFunc(egoIds);
        let di = -1, dj = -1;
        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < 5; j++) {
                if (newIds[i][j] !== egoIds[i][j]) {
                    di = i;
                    dj = j;
                    break;
                }
            }
            if (di !== -1) break;
        }
        setFixedEgoIds(pi => pi.map((vi, i) => i === di ? vi.map((v, j) => j === dj ? newIds[di][dj] : v) : vi))
        setEgoIds(newIds);
    }

    const replacementComponents = useMemo(() => Array.from({ length: 12 }).map((_, i) => {
        const pieces = [];
        if (fixedIdentityIds[i]) pieces.push("ID");
        if (fixedEgoIds[i][0]) pieces.push("ZAYIN");
        if (fixedEgoIds[i][1]) pieces.push("TETH");
        if (fixedEgoIds[i][2]) pieces.push("HE");
        if (fixedEgoIds[i][3]) pieces.push("WAW");
        if (fixedEgoIds[i][4]) pieces.push("ALEPH");
        if (pieces.length > 0) return <span key={i} style={{ padding: "0.25rem" }}>Fixed: {pieces.join(", ")}</span>;
        return null;
    }), [fixedIdentityIds, fixedEgoIds]);

    const clearAll = () => {
        setIdentityIds(Array.from({ length: 12 }, () => null));
        setFixedIdentityIds(Array.from({ length: 12 }, () => null));
        setEgoIds(Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => null)));
        setFixedEgoIds(Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => null)));
    }

    const clearAllUnfixed = () => {
        setIdentityIds(fixedIdentityIds);
        setEgoIds(fixedEgoIds);
    }

    const triggerRandomize = () => {
        triggerToolUsedGAEvent("Team Randomizer");
        if (randomizeIdentities) {
            const idOptions = wbState.mode === "w" ?
                wbState.list.filter(x => `${x}`[0] === "1") :
                Object.keys(identities).filter(x => !wbState.list.includes(x));

            const randomizedIds = fixedIdentityIds.map((x, i) => {
                if (x) return x;
                const options = idOptions.filter(id => identities[id].sinnerId === i + 1);
                if (options.length === 0) return null;
                return options[Math.floor(Math.random() * options.length)];
            });

            setIdentityIds(randomizedIds);
        }

        if (randomizeEgos) {
            const idOptions = wbState.mode === "w" ?
                wbState.list.filter(x => `${x}`[0] === "2") :
                Object.keys(egos).filter(x => !wbState.list.includes(x));

            const randomizedIds = fixedEgoIds.map((xi, i) =>
                xi.map((x, j) => {
                    if (x) return x;
                    if (emptyEgoProb > 0 && Math.random() * 100 < emptyEgoProb) return null;
                    const options = idOptions.filter(id => egos[id].sinnerId === i + 1 && egoRankMapping[egos[id].rank] === j);
                    if (options.length === 0) return null;
                    return options[Math.floor(Math.random() * options.length)];
                })
            );

            setEgoIds(randomizedIds);
        }
    }

    const copyToBuild = () => {
        const params = new URLSearchParams({ teamCode: constructTeamCode(identityIds, egoIds, []) });
        router.push(`/builds/new?${params.toString()}`)
    }

    const buttonsPanel = <BuildDisplayMenuCard key={"button"}>
        <div style={{ display: "flex" }}>
            <button onClick={clearAll}>Clear all</button>
            <button onClick={clearAllUnfixed}>Clear all unfixed</button>
        </div>
        <button onClick={() => setWbListOpen(p => !p)}>
            {wbListOpen ? "Hide " : "Show "}Black/Whitelist{wbState.list.length > 0 ? ` (${wbState.list.length})` : null}
        </button>
        <div style={{ display: "flex" }}>
            <button onClick={() => triggerRandomize()} style={{ background: "#1e7e34" }}>
                Randomize!
            </button>
            <button onClick={() => copyToBuild()}>
                Create Build
            </button>
        </div>
    </BuildDisplayMenuCard>

    const settingsPanel = <BuildDisplayMenuCard key={"setting"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label>
                <input type="checkbox" checked={randomizeIdentities} onChange={e => setRandomizeIdentities(e.target.checked)} />
                <span {...getGeneralTooltipProps("This will allow the randomizer to randomize identities")}
                    className="hover-text"
                >
                    Randomize Identities
                </span>
            </label>
            <label>
                <input type="checkbox" checked={randomizeEgos} onChange={e => setRandomizeEgos(e.target.checked)} />
                <span {...getGeneralTooltipProps("This will allow the randomizer to randomize E.G.Os")}
                    className="hover-text"
                >
                    Randomize E.G.Os
                </span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <span style={{ textAlign: "end" }}>Empty E.G.O<br />Probability</span>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <NumberInput min={0} max={100} value={emptyEgoProb} onChange={setEmptyEgoProb} style={{ textAlign: "center", width: "3ch" }} />
                    <span>%</span>
                </div>
            </div>
        </div>
    </BuildDisplayMenuCard>

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Team Randomizer</h1>
        <p style={{ margin: 0 }}>
            Generate randomized teams using customizable settings like fixed identities, whitelist, and blacklist options.
        </p>
        <p className="sub-text" style={{ margin: 0 }}>
            Generated teams can be exported directly into a Team Build to save or share them.
        </p>
        {
            identitiesLoading || egosLoading || initializing ?
                <LoadingContentPageTemplate /> :
                <>
                    <div style={{ width: "100%" }}>
                        <BuildEditingComponent
                            identityIds={identityIds} setIdentityIds={handleSetFixedIdentityIds}
                            egoIds={egoIds} setEgoIds={handleSetFixedEgoIds}
                            minimalEditor={true} replaceDeployment={replacementComponents}
                            insertPanel={[settingsPanel, buttonsPanel]}
                        />
                    </div>

                    {wbListOpen && <WbList wbState={wbState} />}
                </>
        }
    </div>;
}
