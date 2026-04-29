"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./teamRandomizer.module.css";
import BuildDisplayMenuCard from "../components/build/BuildDisplayMenuCard";
import { useData } from "../components/DataProvider";
import BuildEditingComponent from "../components/editors/BuildEditingComponent";
import EgoIcon from "../components/icons/EgoIcon";
import IdentityIcon from "../components/icons/IdentityIcon";
import SinnerIcon from "../components/icons/SinnerIcon";
import NumberInput from "../components/objects/NumberInput";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import AllIdEgoSelector from "../components/selectors/AllIdEgoSelector";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { useAuth } from "../database/authProvider";
import { getCompany } from "../database/companies";
import { getLocalStore } from "../database/localDB";
import { bitsetFunctions } from "../lib/bitset";
import { egoRankMapping } from "../lib/constants";
import { constructTeamCode } from "../lib/teamCodeEncoding";

export default function TeamRandomizerPage() {
    const { user, loading } = useAuth();
    const [identities, identitiesLoading] = useData("identities_mini");
    const [egos, egosLoading] = useData("egos_mini");

    const [identityIds, setIdentityIds] = useState(Array.from({ length: 12 }, () => null));
    const [egoIds, setEgoIds] = useState(Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => null)));

    const [fixedIdentityIds, setFixedIdentityIds] = useState(Array.from({ length: 12 }, () => null));
    const [fixedEgoIds, setFixedEgoIds] = useState(Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => null)));

    const [wbMode, setWbMode] = useState("b");
    const [wbList, setWbList] = useState([]);
    const [wbListDisplay, setWbListDisplay] = useState("mixed");
    const [wbListOpen, setWbListOpen] = useState(false);
    const [companyLoading, setCompanyLoading] = useState(false);

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
            if (data.wbMode) setWbMode(data.wbMode);
            if (data.wbList) setWbList(data.wbList);
            if (data.wbListDisplay) setWbListDisplay(data.wbListDisplay);
            if (data.wbListOpen) setWbListOpen(data.wbListOpen);
            if (data.randomizeIdentities) setRandomizeIdentities(data.randomizeIdentities);
            if (data.randomizeEgos) setRandomizeEgos(data.randomizeEgos);
            if (data.emptyEgoProb) setEmptyEgoProb(data.emptyEgoProb);
        }

        getLocalStore("teamRandomizer").get("main").then(handleData);
    }, [initializing]);

    useEffect(() => {
        if (initializing) return;

        const saveData = async () => {
            const data = {
                id: "main",
                fixedIdentityIds, fixedEgoIds,
                wbMode, wbList, wbListDisplay, wbListOpen,
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
    }, [initializing, fixedIdentityIds, fixedEgoIds, wbMode, wbList, wbListDisplay, wbListOpen, randomizeIdentities, randomizeEgos, emptyEgoProb]);

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
        if (randomizeIdentities) {
            const idOptions = wbMode === "w" ?
                wbList.filter(x => `${x}`[0] === "1") :
                Object.keys(identities).filter(x => !wbList.includes(x));

            const randomizedIds = fixedIdentityIds.map((x, i) => {
                if (x) return x;
                const options = idOptions.filter(id => identities[id].sinnerId === i + 1);
                if (options.length === 0) return null;
                return options[Math.floor(Math.random() * options.length)];
            });

            setIdentityIds(randomizedIds);
        }

        if (randomizeEgos) {
            const idOptions = wbMode === "w" ?
                wbList.filter(x => `${x}`[0] === "2") :
                Object.keys(egos).filter(x => !wbList.includes(x));

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

    const applyCompanyData = () => {
        if (identitiesLoading || egosLoading || loading) return;
        setCompanyLoading(true);

        const handleCompany = company => {
            if (!company) return;
            const newValues = [];
            const idMasks = company.identities.map(mask => bitsetFunctions.fromString(mask));
            Object.entries(identities).forEach(([id, identity]) => {
                if (bitsetFunctions.hasFlag(idMasks[identity.sinnerId - 1], Number(id.slice(-2)) - 1)) return;
                newValues.push(id);
            });
            const egoMasks = company.egos.map(mask => bitsetFunctions.fromString(mask));
            Object.entries(egos).forEach(([id, ego]) => {
                if (bitsetFunctions.hasFlag(egoMasks[ego.sinnerId - 1], Number(id.slice(-2)) - 1)) return;
                newValues.push(id);
            });

            setWbMode("b");
            setWbList(newValues);
            setCompanyLoading(false);
        }

        if (user) {
            getCompany(user).then(handleCompany);
        } else {
            getLocalStore("companies").get("main").then(handleCompany);
        }
    }

    const buttonsPanel = <BuildDisplayMenuCard key={"button"}>
        <div style={{ display: "flex" }}>
            <button onClick={clearAll}>Clear all</button>
            <button onClick={clearAllUnfixed}>Clear all unfixed</button>
        </div>
        <button onClick={() => setWbListOpen(p => !p)}>
            {wbListOpen ? "Hide " : "Show "}Black/Whitelist{wbList.length > 0 ? ` (${wbList.length})` : null}
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
                    style={{ borderBottom: "1px #aaa dotted", cursor: "help" }}
                >
                    Randomize Identities
                </span>
            </label>
            <label>
                <input type="checkbox" checked={randomizeEgos} onChange={e => setRandomizeEgos(e.target.checked)} />
                <span {...getGeneralTooltipProps("This will allow the randomizer to randomize E.G.Os")}
                    style={{ borderBottom: "1px #aaa dotted", cursor: "help" }}
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

    const wbListComponent = useMemo(() => {
        if (identitiesLoading || egosLoading) return null;

        const component = (id, i) => {
            if (`${id}`[0] === "1")
                return <div key={i} className={styles.wbComponent} onClick={() => setWbList(p => p.filter(x => x !== id))}>
                    <IdentityIcon id={id} uptie={4} displayName={true} displayRarity={true} />
                </div>
            else
                return <div key={i} className={styles.wbComponent} onClick={() => setWbList(p => p.filter(x => x !== id))}>
                    <EgoIcon id={id} type={"awaken"} displayName={true} displayRarity={true} />
                </div>
        }

        if (wbListDisplay === "mixed")
            return <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem" }}>
                {wbList.map((x, i) => component(x, i))}
            </div>

        const bySinner = {};
        wbList.forEach(x => {
            let sinnerId = `${x}`[0] === "1" ? identities[x].sinnerId : egos[x].sinnerId;
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
    }, [wbList, wbListDisplay, identities, egos, identitiesLoading, egosLoading])

    if (identitiesLoading || egosLoading || initializing) return <LoadingContentPageTemplate />;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <h2 style={{ margin: 0 }}>Team Randomizer</h2>
        <span style={{ maxWidth: "1000px", textAlign: "center" }}>This tool allows you to generate a randomized team based on whatever settings you give it. You can fix identities and E.G.Os by selecting them in the builder below. You can also blacklist or whitelist identities and E.G.Os at the bottom of the page. When you are done, you can hit randomize and let it generate a random team! If you like the randomized team, Create Build will send you to the create a Team Build page with that team. Any settings you change are saved locally, but randomized teams are not saved.</span>
        <div style={{ width: "100%" }}>
            <BuildEditingComponent
                identityIds={identityIds} setIdentityIds={handleSetFixedIdentityIds}
                egoIds={egoIds} setEgoIds={handleSetFixedEgoIds}
                minimalEditor={true} replaceDeployment={replacementComponents}
                insertPanel={[settingsPanel, buttonsPanel]}
            />
        </div>

        {wbListOpen ? <>
            <div style={{ display: "flex", gap: "1rem", alignSelf: "start", alignItems: "center" }}>
                <span className={`tab-header ${wbMode === "b" ? "active" : null}`} onClick={() => setWbMode("b")}>Blacklist</span>
                <span className={`tab-header ${wbMode === "w" ? "active" : null}`} onClick={() => setWbMode("w")}>Whitelist</span>
                <button onClick={() => applyCompanyData()} disabled={companyLoading}>Apply Company Data</button>
                <button onClick={() => setWbList([])}>Clear All</button>
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
                identityIds={wbList.filter(x => `${x}`[0] === "1")}
                egoIds={wbList.filter(x => `${x}`[0] === "2")}
                setIdentityId={x => setWbList(p => [...p, x])}
                setEgoId={x => setWbList(p => [...p, x])}
                identityOptions={identities}
                egoOptions={egos}
            />
        </> : null
        }
    </div>;
}
