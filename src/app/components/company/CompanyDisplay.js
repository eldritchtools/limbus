"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactTimeAgo from "react-time-ago";

import styles from "./CompanyDisplay.module.css";
import { useData } from "../DataProvider";
import EgoIcon from "../icons/EgoIcon";
import IdentityIcon from "../icons/IdentityIcon";
import SinnerIcon from "../icons/SinnerIcon";
import NoPrefetchLink from "../NoPrefetchLink";
import IconsSelector from "../selectors/IconsSelector";

import { useAuth } from "@/app/database/authProvider";
import { getCompany, getCompanyByUsername, updateCompany } from "@/app/database/companies";
import { getLocalStore } from "@/app/database/localDB";
import { bitsetFunctions } from "@/app/lib/bitset";
import { sinnerIdMapping } from "@/app/lib/constants";
import { checkFilterMatch, filterByFilters } from "@/app/lib/filter";
import useLocalState from "@/app/lib/useLocalState";

const itemOwned = (bitsets, item) => bitsetFunctions.hasFlag(bitsets[item.sinnerId - 1], Number(item.id.slice(-2)) - 1);
const setFlag = (bitset, item) => bitsetFunctions.setFlag(bitset, Number(item.id.slice(-2)) - 1);
const unsetFlag = (bitset, item) => bitsetFunctions.unsetFlag(bitset, Number(item.id.slice(-2)) - 1);

function IdentityDisplay({ identity, identityBitsets, setIdentityBitsets, editable }) {
    const owned = itemOwned(identityBitsets, identity);
    const className = `${styles.clickableIcon} ${owned ? styles.owned : styles.unowned}`;

    if (editable) {
        const handleClick = () =>
            setIdentityBitsets(p => p.map((x, i) => i === identity.sinnerId - 1 ?
                (owned ? unsetFlag(x, identity) : setFlag(x, identity)) :
                x)
            )

        return <div onClick={handleClick} className={className}>
            <IdentityIcon identity={identity} uptie={4} displayName={true} displayRarity={true} />
        </div>
    } else {
        return <NoPrefetchLink href={`/identities/${identity.id}`} className={className}>
            <IdentityIcon identity={identity} uptie={4} displayName={true} displayRarity={true} />
        </NoPrefetchLink>
    }
}

function EgoDisplay({ ego, egoBitsets, setEgoBitsets, editable }) {
    const owned = itemOwned(egoBitsets, ego);
    const className = `${styles.clickableIcon} ${owned ? styles.owned : styles.unowned}`;

    if (editable) {
        const handleClick = () =>
            setEgoBitsets(p => p.map((x, i) => i === ego.sinnerId - 1 ?
                (owned ? unsetFlag(x, ego) : setFlag(x, ego)) :
                x)
            )

        return <div onClick={handleClick} className={className}>
            <EgoIcon ego={ego} type={"awaken"} displayName={true} displayRarity={true} />
        </div>
    } else {
        return <NoPrefetchLink href={`/egos/${ego.id}`} className={className}>
            <EgoIcon ego={ego} type={"awaken"} displayName={true} displayRarity={true} />
        </NoPrefetchLink>
    }
}

function CompanyDisplayMain({ identityBitsets, setIdentityBitsets, egoBitsets, setEgoBitsets, identities, egos, editable, setForceSave, saveString }) {
    const [activeTab, setActiveTab] = useLocalState("companyActiveTab", "both");
    const [ownedFilter, setOwnedFilter] = useLocalState("companyOwnedFilter", "both");
    const [separateSinners, setSeparateSinners] = useLocalState("companySeparateSinners", false);
    const [strictFiltering, setStrictFiltering] = useLocalState("companyStrictFiltering", false);
    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useState([]);
    const { isMobile } = useBreakpoint();

    const cycleOwnedFilter = () => {
        if (ownedFilter === "both") setOwnedFilter("yes");
        else if (ownedFilter === "yes") setOwnedFilter("no");
        else setOwnedFilter("both");
    }

    const items = useMemo(() => {
        const filtered = [];

        if (activeTab === "both" || activeTab === "id") {
            filtered.push(...filterByFilters("identity",
                Object.values(identities),
                filters,
                identity => {
                    if (searchString.length > 0 && !checkFilterMatch(searchString, identity.name)) return false;
                    if (ownedFilter === "yes" && !itemOwned(identityBitsets, identity)) return false;
                    if (ownedFilter === "no" && itemOwned(identityBitsets, identity)) return false;
                    return true;
                },
                strictFiltering
            ).sort((a, b) => a.sinnerId === b.sinnerId ? b.id.localeCompare(a.id) : a.sinnerId - b.sinnerId))
        }

        if (activeTab === "both" || activeTab === "ego") {
            filtered.push(...filterByFilters("ego",
                Object.values(egos),
                filters,
                ego => {
                    if (searchString.length > 0 && !checkFilterMatch(searchString, ego.name)) return false;
                    if (ownedFilter === "yes" && !itemOwned(egoBitsets, ego)) return false;
                    if (ownedFilter === "no" && itemOwned(egoBitsets, ego)) return false;
                    return true;
                },
                strictFiltering
            ).sort((a, b) => a.sinnerId === b.sinnerId ? b.id.localeCompare(a.id) : a.sinnerId - b.sinnerId))
        }

        if (separateSinners) {
            return filtered.reduce((acc, item) => {
                if (item.sinnerId in acc) acc[item.sinnerId].push(item);
                else acc[item.sinnerId] = [item];
                return acc;
            }, {});
        }

        return filtered;
    }, [identityBitsets, egoBitsets, identities, egos, activeTab, ownedFilter, separateSinners, strictFiltering, searchString, filters]);

    const contentDisplay = () => {
        const listToComponents = list =>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 92 : 128}px, 1fr))`, width: "100%", gap: "0.5rem" }}>
                {list.map(obj => obj.id[0] === "1" ?
                    <IdentityDisplay key={obj.id} identity={obj} identityBitsets={identityBitsets} setIdentityBitsets={setIdentityBitsets} editable={editable} /> :
                    <EgoDisplay key={obj.id} ego={obj} egoBitsets={egoBitsets} setEgoBitsets={setEgoBitsets} editable={editable} />
                )}
            </div>

        if (separateSinners) {
            return <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                {Object.entries(items).map(([sinnerId, list]) => [
                    <div key={sinnerId} style={{ display: "flex", flexDirection: "row", alignItems: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                        <SinnerIcon num={sinnerId} style={{ width: "48px", height: "48px" }} />
                        {sinnerIdMapping[sinnerId]}
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
        const list = separateSinners ? Object.entries(items).map(([, list]) => list).flat() : items;
        const newIdBitsets = [...identityBitsets];
        const newEgoBitsets = [...egoBitsets]

        list.forEach(obj => {
            if (obj.id[0] === "1") {
                newIdBitsets[obj.sinnerId - 1] = setFlag(newIdBitsets[obj.sinnerId - 1], obj);
            } else {
                newEgoBitsets[obj.sinnerId - 1] = setFlag(newEgoBitsets[obj.sinnerId - 1], obj);
            }
        })

        setIdentityBitsets(newIdBitsets);
        setEgoBitsets(newEgoBitsets);
    }

    const unsetAllFiltered = () => {
        const list = separateSinners ? Object.entries(items).map(([, list]) => list).flat() : items;
        const newIdBitsets = [...identityBitsets];
        const newEgoBitsets = [...egoBitsets]

        list.forEach(obj => {
            if (obj.id[0] === "1") {
                newIdBitsets[obj.sinnerId - 1] = unsetFlag(newIdBitsets[obj.sinnerId - 1], obj);
            } else {
                newEgoBitsets[obj.sinnerId - 1] = unsetFlag(newEgoBitsets[obj.sinnerId - 1], obj);
            }
        })

        setIdentityBitsets(newIdBitsets);
        setEgoBitsets(newEgoBitsets);
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem", width: "100%" }}>
        <h2 style={{ display: "flex", marginBottom: "1rem", gap: "1rem" }}>
            <div className={`tab-header ${activeTab === "both" ? "active" : ""}`} onClick={() => setActiveTab("both")}>Both</div>
            <div className={`tab-header ${activeTab === "id" ? "active" : ""}`} onClick={() => setActiveTab("id")}>Identities</div>
            <div className={`tab-header ${activeTab === "ego" ? "active" : ""}`} onClick={() => setActiveTab("ego")}>E.G.Os</div>
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
            <label style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <input type="checkbox" checked={strictFiltering} onChange={e => setStrictFiltering(e.target.checked)} />
                Strict Filtering
            </label>
            {editable ? <>
                <button onClick={setAllFiltered}>
                    Set All Filtered Items
                </button>
                <button onClick={unsetAllFiltered}>
                    Unset All Filtered Items
                </button>
                <button onClick={() => setForceSave(true)}>
                    Save
                </button>
                <div>
                    {saveString}
                </div>
            </> : null
            }
        </div>

        {activeTab === "both" ?
            <IconsSelector type={"row"} categories={["identityTier", "egoTier", "sinner", "status", "affinity", "skillType"]} values={filters} setValues={setFilters} borderless={true} /> :
            activeTab === "id" ?
                <IconsSelector type={"row"} categories={["identityTier", "sinner", "status", "affinity", "skillType"]} values={filters} setValues={setFilters} borderless={true} /> :
                <IconsSelector type={"row"} categories={["egoTier", "sinner", "status", "affinity", "atkType"]} values={filters} setValues={setFilters} borderless={true} />
        }

        {contentDisplay()}
    </div>
}

export default function CompanyDisplay({ username, editable = false }) {
    const { user, loading } = useAuth();
    const [identities, identitiesLoading] = useData("identities");
    const [egos, egosLoading] = useData("egos");
    const [identityBitsets, setIdentityBitsets] = useState([]);
    const [egoBitsets, setEgoBitsets] = useState([]);
    const [contentLoading, setContentLoading] = useState(true);
    const [notSet, setNotSet] = useState(false);

    const [changed, setChanged] = useState(false);
    const [forceSave, setForceSave] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [saveStatus, setSaveStatus] = useState("idle");
    const saveTimeout = useRef(null);

    useEffect(() => {
        if (!contentLoading || loading) return;

        const handleCompany = company => {
            if (!company) {
                if (editable) {
                    setIdentityBitsets(Array.from({ length: 12 }, () => bitsetFunctions.newMask()));
                    setEgoBitsets(Array.from({ length: 12 }, () => bitsetFunctions.newMask()));
                } else {
                    setNotSet(true);
                }
            } else {
                setIdentityBitsets(company.identities.map(mask => bitsetFunctions.fromString(mask)));
                setEgoBitsets(company.egos.map(mask => bitsetFunctions.fromString(mask)));
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
                egos: egoBitsets.map(bitset => bitsetFunctions.toString(bitset))
            }

            if (user) {
                await updateCompany(user, data);
            } else {
                await getLocalStore("companies").save({ ...data, id: "main" });
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
        }, forceSave ? 0 : 5000);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForceSave(false);
        return () => clearTimeout(saveTimeout.current);
    }, [identityBitsets, egoBitsets, changed, user, editable, forceSave]);

    const saveString = useMemo(() => {
        if (saveStatus === "idle") return null;
        if (saveStatus === "saving") return "Saving changes";
        if (saveStatus === "saved") return <div>Last Saved: <ReactTimeAgo date={lastSaved} locale="en-US" timeStyle="mini" /> ago</div>;
        if (saveStatus === "error") return "Unable to save changes";
        return null;
    }, [saveStatus, lastSaved]);

    if (loading || contentLoading || identitiesLoading || egosLoading) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;
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

    return <CompanyDisplayMain
        identityBitsets={identityBitsets} setIdentityBitsets={handleSetIdentityBitsets}
        egoBitsets={egoBitsets} setEgoBitsets={handleSetEgoBitsets}
        identities={identities} egos={egos}
        editable={editable} setForceSave={setForceSave} saveString={saveString}
    />
}