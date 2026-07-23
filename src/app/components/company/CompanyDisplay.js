"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactTimeAgo from "react-time-ago";

import styles from "./CompanyDisplay.module.css";
import { useData } from "../DataProvider";
import AnnouncerIcon from "../icons/AnnouncerIcon";
import EgoIcon from "../icons/EgoIcon";
import IdentityIcon from "../icons/IdentityIcon";
import SinnerIcon from "../icons/SinnerIcon";
import NoPrefetchLink from "../NoPrefetchLink";
import AdvancedOptionsSelector, { AdvancedOptionsLabels, getFilterSortAdvancedOptionsData } from "../selectors/AdvancedOptionsSelector";
import IconsSelector from "../selectors/IconsSelector";

import { useAuth } from "@/app/database/authProvider";
import { getCompany, getCompanyByUsername, updateCompany } from "@/app/database/companies";
import { getLocalStore } from "@/app/database/localDB";
import { bitsetFunctions } from "@/app/lib/bitset";
import { sinnerIdMapping } from "@/app/lib/constants";
import { buildSearchStrings, checkFilterMatch, filterByFilters } from "@/app/lib/filter";
import { triggerToolUsedGAEvent } from "@/app/lib/gaEvents";
import useLocalState from "@/app/lib/useLocalState";

const itemOwned = (bitsets, item) => bitsetFunctions.hasFlag(bitsets[item.sinnerId - 1], Number(item.id.slice(-2)) - 1);
const setFlag = (bitset, item) => bitsetFunctions.setFlag(bitset, Number(item.id.slice(-2)) - 1);
const unsetFlag = (bitset, item) => bitsetFunctions.unsetFlag(bitset, Number(item.id.slice(-2)) - 1);

const announcerItemOwned = (bitset, item) => bitsetFunctions.hasFlag(bitset, Number(item.id) - 1);
const announcerSetFlag = (bitset, item) => bitsetFunctions.setFlag(bitset, Number(item.id) - 1);
const announcerUnsetFlag = (bitset, item) => bitsetFunctions.unsetFlag(bitset, Number(item.id) - 1);

function IdentityDisplay({ identity, identityBitsets, setIdentityBitsets, editable, data, advancedOptions }) {
    const owned = itemOwned(identityBitsets, identity);
    const className = `${styles.clickableIcon} ${owned ? styles.owned : styles.unowned}`;

    if (editable) {
        const handleClick = () =>
            setIdentityBitsets(p => p.map((x, i) => i === identity.sinnerId - 1 ?
                (owned ? unsetFlag(x, identity) : setFlag(x, identity)) :
                x)
            )

        return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div onClick={handleClick} className={className} style={{ alignSelf: "stretch" }}>
                <IdentityIcon identity={identity} uptie={4} displayName={true} displayRarity={true} />
            </div>
            <AdvancedOptionsLabels mode={"id"} advancedOptions={advancedOptions} data={data} />
        </div>
    } else {
        return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <NoPrefetchLink href={`/identities/${identity.id}`} className={className} style={{ alignSelf: "stretch" }}>
                <IdentityIcon identity={identity} uptie={4} displayName={true} displayRarity={true} />
            </NoPrefetchLink >
            <AdvancedOptionsLabels mode={"id"} advancedOptions={advancedOptions} data={data} />
        </div>
    }
}

function EgoDisplay({ ego, egoBitsets, setEgoBitsets, editable, data, advancedOptions }) {
    const owned = itemOwned(egoBitsets, ego);
    const className = `${styles.clickableIcon} ${owned ? styles.owned : styles.unowned}`;

    if (editable) {
        const handleClick = () =>
            setEgoBitsets(p => p.map((x, i) => i === ego.sinnerId - 1 ?
                (owned ? unsetFlag(x, ego) : setFlag(x, ego)) :
                x)
            )

        return <div onClick={handleClick} className={className} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <EgoIcon ego={ego} type={"awaken"} displayName={true} displayRarity={true} />
            <AdvancedOptionsLabels mode={"ego"} advancedOptions={advancedOptions} data={data} />
        </div>
    } else {
        return <NoPrefetchLink href={`/egos/${ego.id}`} className={className} style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "var(--primary-text-color)", textDecoration: "none" }}>
            <EgoIcon ego={ego} type={"awaken"} displayName={true} displayRarity={true} />
            <AdvancedOptionsLabels mode={"ego"} advancedOptions={advancedOptions} data={data} />
        </NoPrefetchLink>
    }
}

function AnnouncerDisplay({ announcer, announcerBitset, setAnnouncerBitset, editable }) {
    const owned = announcerItemOwned(announcerBitset, announcer);
    const className = `${styles.clickableIcon} ${owned ? styles.owned : styles.unowned}`;

    if (editable) {
        const handleClick = () =>
            setAnnouncerBitset(p => owned ? announcerUnsetFlag(p, announcer) : announcerSetFlag(p, announcer))

        return <div onClick={handleClick} className={className}>
            <AnnouncerIcon announcer={announcer} displayName={true} />
        </div>
    } else {
        return <div className={className}>
            <AnnouncerIcon announcer={announcer} displayName={true} />
        </div>
    }
}

function CompanyDisplayMain({
    identityBitsets, setIdentityBitsets,
    egoBitsets, setEgoBitsets,
    announcerBitset, setAnnouncerBitset,
    identities, egos, announcers,
    editable, setForceSave, saveString
}) {
    const [altNames, altNamesLoading] = useData("alt_names");
    const [activeTab, setActiveTab] = useLocalState("companyActiveTab", "all");
    const [ownedFilter, setOwnedFilter] = useLocalState("companyOwnedFilter", "both");
    const [separateSinners, setSeparateSinners] = useLocalState("companySeparateSinners", false);
    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useState([]);
    const [identityAdvOpts, setIdentityAdvOpts] = useState([]);
    const [egoAdvOpts, setEgoAdvOpts] = useState([]);
    const [announcerAdvOpts, setAnnouncerAdvOpts] = useState([]);
    const [allAdvOpts, setAllAdvOpts] = useState([]);
    const { isMobile } = useBreakpoint();

    const cycleOwnedFilter = () => {
        if (ownedFilter === "both") setOwnedFilter("yes");
        else if (ownedFilter === "yes") setOwnedFilter("no");
        else setOwnedFilter("both");
    }

    const [items, count, totalCount] = useMemo(() => {
        let filtered = [];
        const sortFunctions = [];

        const { strict, addedFilters, filterFunction, sortFunctions: sortFuncs } =
            getFilterSortAdvancedOptionsData(activeTab,
                activeTab === "all" ?
                    allAdvOpts :
                    (activeTab === "id" ?
                        identityAdvOpts :
                        (activeTab === "ego" ?
                            egoAdvOpts :
                            announcerAdvOpts
                        )
                    )
            );

        sortFunctions.push(...sortFuncs);

        let count = 0, totalCount = 0;

        if (activeTab === "all" || activeTab === "id") {
            const items = filterByFilters("identity",
                Object.values(identities),
                [...filters, ...addedFilters],
                identity => {
                    if (searchString.length > 0 && !checkFilterMatch(searchString, buildSearchStrings(identity, altNamesLoading ? null : altNames))) return false;
                    if (ownedFilter === "yes" && !itemOwned(identityBitsets, identity)) return false;
                    if (ownedFilter === "no" && itemOwned(identityBitsets, identity)) return false;
                    if (!filterFunction(identity)) return false;
                    return true;
                },
                strict
            );

            items.forEach(identity => {
                totalCount += 1;
                if (itemOwned(identityBitsets, identity)) count += 1;
            });

            filtered.push(...items.map(x => ["id", x]));
        }

        if (activeTab === "all" || activeTab === "ego") {
            const items = filterByFilters("ego",
                Object.values(egos),
                [...filters, ...addedFilters],
                ego => {
                    if (searchString.length > 0 && !checkFilterMatch(searchString, buildSearchStrings(ego, altNamesLoading ? null : altNames))) return false;
                    if (ownedFilter === "yes" && !itemOwned(egoBitsets, ego)) return false;
                    if (ownedFilter === "no" && itemOwned(egoBitsets, ego)) return false;
                    if (!filterFunction(ego)) return false;
                    return true;
                },
                strict
            );

            items.forEach(ego => {
                totalCount += 1;
                if (itemOwned(egoBitsets, ego)) count += 1;
            });

            filtered.push(...items.map(x => ["ego", x]));
        }

        if (activeTab === "all" || activeTab === "announcer") {
            const items = filterByFilters("announcer",
                Object.values(announcers),
                [...filters, ...addedFilters],
                announcer => {
                    if (announcer.hidden) return false;
                    if (searchString.length > 0 && !checkFilterMatch(searchString, [announcer.name])) return false;
                    if (ownedFilter === "yes" && !announcerItemOwned(announcerBitset, announcer)) return false;
                    if (ownedFilter === "no" && announcerItemOwned(announcerBitset, announcer)) return false;
                    if (!filterFunction(announcer)) return false;
                    return true;
                },
                strict
            );

            items.forEach(announcer => {
                totalCount += 1;
                if (announcerItemOwned(announcerBitset, announcer)) count += 1;
            });

            filtered.push(...items.map(x => ["announcer", x]));
        }

        const sortFunctionsB = [
            ([a], [b]) => {
                if (a === b) return 0;
                if (a === "id") return -1;
                if (b === "id") return 1;
                if (a === "ego") return -1;
                if (b === "ego") return 1;
                return 0;
            },
            ([, a], [, b]) => {
                if (a.sinnerId === b.sinnerId) return 0;
                if (!a.sinnerId) return 1;
                if (!b.sinnerId) return -1;
                return a.sinnerId - b.sinnerId;
            },
            ([, a], [, b]) => Number(b.id) - Number(a.id)
        ];

        filtered = filtered.sort((a, b) => {
            for (let i = 0; i < sortFunctions.length; i++) {
                const res = sortFunctions[i](a[1], b[1]);
                if (res === 0) continue;
                return res;
            }
            for (let i = 0; i < sortFunctionsB.length; i++) {
                const res = sortFunctionsB[i](a, b);
                if (res === 0) continue;
                return res;
            }
            return 0;
        });

        if (separateSinners) {
            return [
                filtered.reduce((acc, [t, item]) => {
                    const sinnerId = item.sinnerId ?? 99;
                    if (sinnerId in acc) acc[sinnerId].push([t, item]);
                    else acc[sinnerId] = [[t, item]];
                    return acc;
                }, {}),
                count,
                totalCount
            ];
        }

        return [filtered, count, totalCount];
    }, [
        identityBitsets, egoBitsets, announcerBitset,
        identities, egos, announcers,
        activeTab, ownedFilter, separateSinners, searchString,
        filters, altNames, altNamesLoading,
        allAdvOpts, identityAdvOpts, egoAdvOpts, announcerAdvOpts
    ]);

    const contentDisplay = () => {
        const listToComponents = list =>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 92 : 128}px, 1fr))`, width: "100%", gap: "0.5rem" }}>
                {list.map(([t, obj]) =>
                    t === "id" ?
                        <IdentityDisplay key={obj.id}
                            identity={obj} identityBitsets={identityBitsets}
                            setIdentityBitsets={setIdentityBitsets} editable={editable}
                            data={obj} advancedOptions={activeTab === "all" ? allAdvOpts : identityAdvOpts}
                        /> :
                        t === "ego" ?
                            <EgoDisplay key={obj.id}
                                ego={obj} egoBitsets={egoBitsets}
                                setEgoBitsets={setEgoBitsets} editable={editable}
                                data={obj} advancedOptions={activeTab === "all" ? allAdvOpts : egoAdvOpts}
                            /> :
                            t === "announcer" ?
                                <AnnouncerDisplay key={obj.id}
                                    announcer={obj} announcerBitset={announcerBitset}
                                    setAnnouncerBitset={setAnnouncerBitset} editable={editable}
                                /> :
                                null
                )}
            </div>

        if (separateSinners) {
            return <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                {Object.entries(items).map(([sinnerId, list]) => [
                    sinnerId !== "99" ?
                        <div key={sinnerId} style={{ display: "flex", flexDirection: "row", alignItems: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                            <SinnerIcon num={sinnerId} style={{ width: "48px", height: "48px" }} />
                            {sinnerIdMapping[sinnerId]}
                        </div> :
                        <div style={{ display: "flex", alignItems: "center", fontSize: "1.2rem", height: "48px", fontWeight: "bold" }}>
                            Announcers
                        </div>,
                    <div key={`${sinnerId}-list`}>
                        {listToComponents(list)}
                    </div>
                ]).flat()}
            </div>
        } else {
            return listToComponents(items);
        }
    }

    const setAllFiltered = () => {
        const list = separateSinners ? 
            Object.entries(items).map(([, list]) => list).reduce((acc, list) => {acc.push(...list); return acc;}, []) : items;
        const newIdBitsets = [...identityBitsets];
        const newEgoBitsets = [...egoBitsets];
        let newAnnouncerBitset = announcerBitset;

        list.forEach(([t, obj]) => {
            if (t === "id")
                newIdBitsets[obj.sinnerId - 1] = setFlag(newIdBitsets[obj.sinnerId - 1], obj);
            else if (t === "ego")
                newEgoBitsets[obj.sinnerId - 1] = setFlag(newEgoBitsets[obj.sinnerId - 1], obj);
            else if (t === "announcer")
                newAnnouncerBitset = announcerSetFlag(newAnnouncerBitset, obj);
        })

        setIdentityBitsets(newIdBitsets);
        setEgoBitsets(newEgoBitsets);
        setAnnouncerBitset(newAnnouncerBitset);
    }

    const unsetAllFiltered = () => {
        const list = separateSinners ? 
            Object.entries(items).map(([, list]) => list).reduce((acc, list) => {acc.push(...list); return acc;}, []) : items;
        const newIdBitsets = [...identityBitsets];
        const newEgoBitsets = [...egoBitsets]
        let newAnnouncerBitset = announcerBitset;

        list.forEach(([t, obj]) => {
            if (t === "id")
                newIdBitsets[obj.sinnerId - 1] = unsetFlag(newIdBitsets[obj.sinnerId - 1], obj);
            else if (t === "ego")
                newEgoBitsets[obj.sinnerId - 1] = unsetFlag(newEgoBitsets[obj.sinnerId - 1], obj);
            else if (t === "announcer")
                newAnnouncerBitset = announcerUnsetFlag(newAnnouncerBitset, obj);
        })

        setIdentityBitsets(newIdBitsets);
        setEgoBitsets(newEgoBitsets);
        setAnnouncerBitset(newAnnouncerBitset);
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem", width: "100%" }}>
        {editable && <div style={{ display: "flex", alignItems: "center", alignSelf: "center", gap: "0.2rem" }}>
            <button onClick={() => setForceSave(true)}>
                Save Changes
            </button>
            <div>
                {saveString}
            </div>
        </div>}
        <h2 style={{ display: "flex", marginBottom: "1rem", gap: "1rem" }}>
            <div className={`tab-header ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All</div>
            <div className={`tab-header ${activeTab === "id" ? "active" : ""}`} onClick={() => setActiveTab("id")}>Identities</div>
            <div className={`tab-header ${activeTab === "ego" ? "active" : ""}`} onClick={() => setActiveTab("ego")}>E.G.Os</div>
            <div className={`tab-header ${activeTab === "announcer" ? "active" : ""}`} onClick={() => setActiveTab("announcer")}>Announcers</div>
        </h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.1rem", alignItems: "center" }}>
            <input type="text" placeholder="Search..." value={searchString} onChange={(e) => setSearchString(e.target.value)} />
            <button onClick={() => cycleOwnedFilter()}>
                {ownedFilter === "both" ? "All Items" : ownedFilter === "yes" ? "Owned Only" : "Unowned Only"}
            </button>
            <label style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <input type="checkbox" checked={separateSinners} onChange={e => setSeparateSinners(e.target.checked)} />
                Separate by Sinner
            </label>
            {editable && <>
                <button onClick={setAllFiltered}>
                    Set All Filtered Items
                </button>
                <button onClick={unsetAllFiltered}>
                    Unset All Filtered Items
                </button>
            </>
            }
        </div>

        {activeTab === "all" ?
            <IconsSelector type={"row"} categories={["identityTier", "egoTier", "sinner", "status", "affinity", "skillType"]} values={filters} setValues={setFilters} borderless={true} /> :
            activeTab === "id" ?
                <IconsSelector type={"row"} categories={["identityTier", "sinner", "status", "affinity", "skillType"]} values={filters} setValues={setFilters} borderless={true} /> :
                activeTab === "ego" ?
                    <IconsSelector type={"row"} categories={["egoTier", "sinner", "status", "affinity", "atkType"]} values={filters} setValues={setFilters} borderless={true} /> :
                    null
        }

        <AdvancedOptionsSelector
            mode={activeTab}
            options={activeTab === "all" ? allAdvOpts : activeTab === "id" ? identityAdvOpts : (activeTab === "ego" ? egoAdvOpts : announcerAdvOpts)}
            setOptions={activeTab === "all" ? setAllAdvOpts : activeTab === "id" ? setIdentityAdvOpts : (activeTab === "ego" ? setEgoAdvOpts : setAnnouncerAdvOpts)}
        />

        <span style={{ fontWeight: "bold", alignSelf: "center", fontSize: "1.2rem" }}>
            Owned Stats: {count}/{totalCount} ({(100 * count / totalCount).toFixed(2)}%)
        </span>

        {contentDisplay()}
    </div>
}

export default function CompanyDisplay({ username, editable = false }) {
    const { user, loading } = useAuth();
    const [identities, identitiesLoading] = useData("identities");
    const [egos, egosLoading] = useData("egos");
    const [announcers, announcersLoading] = useData("announcers");
    const [identityBitsets, setIdentityBitsets] = useState([]);
    const [egoBitsets, setEgoBitsets] = useState([]);
    const [announcerBitset, setAnnouncerBitset] = useState(null);
    const [contentLoading, setContentLoading] = useState(true);
    const [notSet, setNotSet] = useState(false);

    const [changed, setChanged] = useState(false);
    const [forceSave, setForceSave] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [saveStatus, setSaveStatus] = useState("idle");
    const saveTimeout = useRef(null);
    const [firstSave, setFirstSave] = useState(true);

    useEffect(() => {
        if (!contentLoading || loading) return;

        const handleCompany = company => {
            if (!company) {
                if (editable) {
                    setIdentityBitsets(Array.from({ length: 12 }, () => bitsetFunctions.newMask(1)));
                    setEgoBitsets(Array.from({ length: 12 }, () => bitsetFunctions.newMask(1)));
                    setAnnouncerBitset(bitsetFunctions.newMask(0));
                } else {
                    setNotSet(true);
                }
            } else {
                setIdentityBitsets(company.identities.map(mask => bitsetFunctions.fromString(mask)));
                setEgoBitsets(company.egos.map(mask => bitsetFunctions.fromString(mask)));
                setAnnouncerBitset(bitsetFunctions.fromString(company.announcers));
            }
            setContentLoading(false);
        }

        if (username) {
            getCompanyByUsername(username).then(handleCompany);
        } else if (user) {
            getCompany(user).then(handleCompany);
        } else {
            getLocalStore("companies").get("main").then(handleCompany);
        }
    }, [loading, contentLoading, user, username, editable]);

    useEffect(() => {
        if ((!changed || !editable) && !forceSave) return;

        const saveData = async () => {
            const data = {
                identities: identityBitsets.map(bitset => bitsetFunctions.toString(bitset)),
                egos: egoBitsets.map(bitset => bitsetFunctions.toString(bitset)),
                announcers: bitsetFunctions.toString(announcerBitset)
            }

            if (user) {
                await updateCompany(user, data);
            } else {
                await getLocalStore("companies").save({ ...data, id: "main" });
            }

            if (firstSave) {
                setFirstSave(false);
                triggerToolUsedGAEvent("Company");
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
        }, forceSave ? 0 : 3000);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForceSave(false);
        return () => clearTimeout(saveTimeout.current);
    }, [identityBitsets, egoBitsets, announcerBitset, changed, user, editable, forceSave, firstSave]);

    const saveString = useMemo(() => {
        if (saveStatus === "idle") return null;
        if (saveStatus === "saving") return "Saving changes";
        if (saveStatus === "saved") return <div>Last Saved: <ReactTimeAgo date={lastSaved} locale="en-US" timeStyle="mini" /> ago</div>;
        if (saveStatus === "error") return "Unable to save changes";
        return null;
    }, [saveStatus, lastSaved]);

    if (loading || contentLoading || identitiesLoading || egosLoading || announcersLoading) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;
    if (notSet) return <h3 style={{ textAlign: "center" }}>Company has not been set.</h3>;

    const handleSetIdentityBitsets = newBitsets => {
        if (!editable) return;
        setChanged(true);
        setIdentityBitsets(newBitsets);
    }

    const handleSetEgoBitsets = newBitsets => {
        if (!editable) return;
        setChanged(true);
        setEgoBitsets(newBitsets);
    }

    const handleSetAnnouncerBitset = newBitset => {
        if (!editable) return;
        setChanged(true);
        setAnnouncerBitset(newBitset);
    }

    return <CompanyDisplayMain
        identityBitsets={identityBitsets} setIdentityBitsets={handleSetIdentityBitsets}
        egoBitsets={egoBitsets} setEgoBitsets={handleSetEgoBitsets}
        announcerBitset={announcerBitset} setAnnouncerBitset={handleSetAnnouncerBitset}
        identities={identities} egos={egos} announcers={announcers}
        editable={editable} setForceSave={setForceSave} saveString={saveString}
    />
}