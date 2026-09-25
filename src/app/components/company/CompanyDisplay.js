"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { BookmarkIcon as BookmarkIconOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactTimeAgo from "react-time-ago";

import styles from "./CompanyDisplay.module.css";
import { useData } from "../DataProvider";
import AnnouncerIcon from "../icons/AnnouncerIcon";
import EgoIcon from "../icons/EgoIcon";
import FacadeIcon from "../icons/FacadeIcon";
import IdentityIcon from "../icons/IdentityIcon";
import SinnerIcon from "../icons/SinnerIcon";
import NoPrefetchLink from "../NoPrefetchLink";
import DropdownButton from "../objects/DropdownButton";
import HintText from "../objects/HintText";
import AdvancedOptionsSelector, { AdvancedOptionsLabels, getFilterSortAdvancedOptionsData } from "../selectors/AdvancedOptionsSelector";
import IconsSelector from "../selectors/IconsSelector"
import { getGeneralMarkdownTooltipProps } from "../tooltips/GeneralMarkdownTooltip";

import { useAuth } from "@/app/database/authProvider";
import { getCompany, getCompanyByUsername, updateCompany } from "@/app/database/companies";
import { getLocalStore } from "@/app/database/localDB";
import { bitsetFunctions } from "@/app/lib/bitset";
import { sinnerIdMapping } from "@/app/lib/constants";
import { buildSearchStrings, checkFilterMatch, filterByFilters } from "@/app/lib/filter";
import { triggerToolUsedGAEvent } from "@/app/lib/gaEvents";
import useLocalState from "@/app/lib/useLocalState";
import { SITE_ROOT } from "@/app/paths";

const itemOwned = (bitsets, item, offset = 0) => bitsetFunctions.hasFlag(bitsets[item.sinnerId - 1 + offset], Number(item.id.slice(-2)) - 1);
const setFlag = (bitset, item, offset = 0) => bitsetFunctions.setFlag(bitset, Number(item.id.slice(-2)) - 1 + offset);
const unsetFlag = (bitset, item, offset = 0) => bitsetFunctions.unsetFlag(bitset, Number(item.id.slice(-2)) - 1 + offset);

const announcerItemOwned = (bitset, item) => bitsetFunctions.hasFlag(bitset, Number(item.id) - 1);
const announcerSetFlag = (bitset, item) => bitsetFunctions.setFlag(bitset, Number(item.id) - 1);
const announcerUnsetFlag = (bitset, item) => bitsetFunctions.unsetFlag(bitset, Number(item.id) - 1);

const filterOptions = {
    "both": "All Items",
    "yes": "Owned Only",
    "no": "Unowned Only",
    "wish": "Wishlisted Only"
}

function WishlistWrapper({ wishlistToggled, wishlist, setWishlist, wishlistKey, owned, editable, children }) {
    return <div style={{ position: "relative", width: "100%" }}>
        {children}
        {wishlist.includes(wishlistKey) ?
            <div
                onClick={wishlistToggled && editable ? () => setWishlist(p => p.filter(x => x !== wishlistKey)) : undefined}
                style={{ position: "absolute", top: "2px", right: "2px", cursor: wishlistToggled && editable ? "pointer" : "default" }}
            >
                <BookmarkIconSolid style={{ width: "24px", height: "24px", color: "#F0C44F" }} />
            </div> :
            (wishlistToggled && editable && !owned &&
                <div
                    onClick={() => setWishlist(p => [...p, wishlistKey])}
                    style={{ position: "absolute", top: "2px", right: "2px", cursor: "pointer" }}
                >
                    <BookmarkIconOutline style={{ width: "24px", height: "24px", color: "#F0C44F" }} />
                </div>
            )
        }
    </div>
}

function IdentityDisplay({
    identity, identityBitsets, setIdentityBitsets,
    editable, data, advancedOptions,
    wishlistToggled, wishlist, setWishlist, wishlistKey
}) {
    const owned = itemOwned(identityBitsets, identity);
    const className = `${styles.clickableIcon} ${owned ? styles.owned : styles.unowned}`;
    let component;

    if (editable) {
        const handleClick = () => {
            setIdentityBitsets(p => p.map((x, i) => i === identity.sinnerId - 1 ?
                (owned ? unsetFlag(x, identity) : setFlag(x, identity)) :
                x)
            );
            if (!owned) setWishlist(p => p.filter(x => x !== wishlistKey));
        }

        component = <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div onClick={handleClick} className={className} style={{ alignSelf: "stretch" }}>
                <IdentityIcon identity={identity} uptie={4} displayName={true} displayRarity={true} />
            </div>
            <AdvancedOptionsLabels mode={"id"} advancedOptions={advancedOptions} data={data} />
        </div>
    } else {
        component = <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <NoPrefetchLink href={`/identities/${identity.id}`} className={className} style={{ alignSelf: "stretch" }}>
                <IdentityIcon identity={identity} uptie={4} displayName={true} displayRarity={true} />
            </NoPrefetchLink >
            <AdvancedOptionsLabels mode={"id"} advancedOptions={advancedOptions} data={data} />
        </div>
    }

    return <WishlistWrapper
        wishlistToggled={wishlistToggled} wishlist={wishlist} setWishlist={setWishlist}
        wishlistKey={wishlistKey} owned={owned} editable={editable}
    >
        {component}
    </WishlistWrapper>
}

function EgoDisplay({
    ego, egoBitsets, setEgoBitsets,
    editable, data, advancedOptions,
    wishlistToggled, wishlist, setWishlist, wishlistKey
}) {
    const owned = itemOwned(egoBitsets, ego);
    const className = `${styles.clickableIcon} ${owned ? styles.owned : styles.unowned}`;
    let component;

    if (editable) {
        const handleClick = () => {
            setEgoBitsets(p => p.map((x, i) => i === ego.sinnerId - 1 ?
                (owned ? unsetFlag(x, ego) : setFlag(x, ego)) :
                x)
            );
            if (!owned) setWishlist(p => p.filter(x => x !== wishlistKey));
        }

        component = <div onClick={handleClick} className={className} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <EgoIcon ego={ego} type={"awaken"} displayName={true} displayRarity={true} />
            <AdvancedOptionsLabels mode={"ego"} advancedOptions={advancedOptions} data={data} />
        </div>
    } else {
        component = <NoPrefetchLink href={`/egos/${ego.id}`} className={className} style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "var(--primary-text-color)", textDecoration: "none" }}>
            <EgoIcon ego={ego} type={"awaken"} displayName={true} displayRarity={true} />
            <AdvancedOptionsLabels mode={"ego"} advancedOptions={advancedOptions} data={data} />
        </NoPrefetchLink>
    }

    return <WishlistWrapper
        wishlistToggled={wishlistToggled} wishlist={wishlist} setWishlist={setWishlist}
        wishlistKey={wishlistKey} owned={owned} editable={editable}
    >
        {component}
    </WishlistWrapper>
}

function AnnouncerDisplay({
    announcer, announcerBitset, setAnnouncerBitset,
    editable,
    wishlistToggled, wishlist, setWishlist, wishlistKey
}) {
    const owned = announcerItemOwned(announcerBitset, announcer);
    const className = `${styles.clickableIcon} ${owned ? styles.owned : styles.unowned}`;
    let component;

    if (editable) {
        const handleClick = () => {
            setAnnouncerBitset(p => owned ? announcerUnsetFlag(p, announcer) : announcerSetFlag(p, announcer));
            if (!owned) setWishlist(p => p.filter(x => x !== wishlistKey));
        }

        component = <div onClick={handleClick} className={className}>
            <AnnouncerIcon announcer={announcer} displayName={true} />
        </div>
    } else {
        component = <div className={className} style={{ cursor: "default" }}>
            <AnnouncerIcon announcer={announcer} displayName={true} />
        </div>
    }

    return <WishlistWrapper
        wishlistToggled={wishlistToggled} wishlist={wishlist} setWishlist={setWishlist}
        wishlistKey={wishlistKey} owned={owned} editable={editable}
    >
        {component}
    </WishlistWrapper>
}

function FacadeDisplay({
    facade, facadeBitsets, setFacadeBitsets,
    editable,
    wishlistToggled, wishlist, setWishlist, wishlistKey
}) {
    const offset = facade.facadeOnly ? 12 : 0;
    const owned = itemOwned(facadeBitsets, facade, offset);
    const className = `${styles.clickableIcon} ${owned ? styles.owned : styles.unowned}`;
    let component;

    if (editable) {
        const handleClick = () => {
            setFacadeBitsets(p => p.map((x, i) => i === facade.sinnerId - 1 + offset ?
                (owned ? unsetFlag(x, facade) : setFlag(x, facade)) :
                x)
            );
            if (!owned) setWishlist(p => p.filter(x => x !== wishlistKey));
        }

        component = <div onClick={handleClick} className={className}>
            <FacadeIcon facade={facade} displayName={true} />
        </div>
    } else {
        component = <div className={className} style={{ cursor: "default" }}>
            <FacadeIcon facade={facade} displayName={true} />
        </div>
    }

    return <WishlistWrapper
        wishlistToggled={wishlistToggled} wishlist={wishlist} setWishlist={setWishlist}
        wishlistKey={wishlistKey} owned={owned} editable={editable}
    >
        {component}
    </WishlistWrapper>
}

function CompanyDisplayMain({
    username,
    identityBitsets, setIdentityBitsets,
    egoBitsets, setEgoBitsets,
    announcerBitset, setAnnouncerBitset,
    facadeBitsets, setFacadeBitsets,
    wishlist, setWishlist,
    identities, egos, announcers, facades,
    editable, setForceSave, saveString
}) {
    const [altNames, altNamesLoading] = useData("alt_names");
    const [activeTabs, setActiveTabs] = useLocalState("companyActiveTabs", ["id", "ego", "announcer"])
    const [ownedFilter, setOwnedFilter] = useLocalState("companyOwnedFilter", "both");
    const [separateSinners, setSeparateSinners] = useLocalState("companySeparateSinners", false);
    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useState([]);
    const [advOpts, setAdvOpts] = useState([]);
    const { isMobile } = useBreakpoint();
    const [hintText, setHintText] = useState(null);
    const [wishlistToggled, setWishlistToggled] = useState(false);

    const advOptsMode = useMemo(() => {
        const idsOn = activeTabs.includes("id");
        const egosOn = activeTabs.includes("ego");
        const announcersOn = activeTabs.includes("announcer");
        const facadesOn = activeTabs.includes("facade");

        if (idsOn && egosOn) {
            if (announcersOn || facadesOn) return "all";
            return "both";
        }
        if (idsOn && !announcersOn && !facadesOn) return "id";
        if (egosOn && !announcersOn && !facadesOn) return "ego";
        if (announcersOn && !idsOn && !egosOn && !facadesOn) return "announcer";
        if (facadesOn && !idsOn && !egosOn && !announcersOn) return "facade";
        return "none";
    }, [activeTabs]);

    const filterCategories = useMemo(() => {
        const idsOn = activeTabs.includes("id");
        const egosOn = activeTabs.includes("ego");
        // const announcersOn = activeTabs.includes("announcer");
        const facadesOn = activeTabs.includes("facade");

        const categories = [];
        if (idsOn) categories.push("identityTier");
        if (egosOn) categories.push("egoTier");
        if (idsOn || egosOn || facadesOn) categories.push("sinner");
        if (idsOn || egosOn) {
            categories.push("status");
            categories.push("affinity");
        };

        if (idsOn) categories.push("skillType");
        else if (egosOn) categories.push("atkType");
        return categories;
    }, [activeTabs]);

    const cycleOwnedFilter = () => {
        if (ownedFilter === "both") setOwnedFilter("yes");
        else if (ownedFilter === "yes") setOwnedFilter("no");
        else if (ownedFilter === "no") setOwnedFilter("wish");
        else setOwnedFilter("both");
    }

    const [items, count, totalCount] = useMemo(() => {
        let filtered = [];
        const sortFunctions = [];

        const { strict, addedFilters, filterFunction, sortFunctions: sortFuncs } =
            getFilterSortAdvancedOptionsData(advOptsMode, advOpts);

        sortFunctions.push(...sortFuncs);

        let count = 0, totalCount = 0;

        if (activeTabs.includes("id")) {
            const items = filterByFilters("identity",
                Object.values(identities),
                [...filters, ...addedFilters],
                identity => {
                    if (searchString.length > 0 && !checkFilterMatch(searchString, buildSearchStrings(identity, altNamesLoading ? null : altNames))) return false;
                    if (ownedFilter === "yes" && !itemOwned(identityBitsets, identity)) return false;
                    if (ownedFilter === "no" && itemOwned(identityBitsets, identity)) return false;
                    if (ownedFilter === "wish" && !wishlist.includes(`i${identity.id}`)) return false;
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

        if (activeTabs.includes("ego")) {
            const items = filterByFilters("ego",
                Object.values(egos),
                [...filters, ...addedFilters],
                ego => {
                    if (searchString.length > 0 && !checkFilterMatch(searchString, buildSearchStrings(ego, altNamesLoading ? null : altNames))) return false;
                    if (ownedFilter === "yes" && !itemOwned(egoBitsets, ego)) return false;
                    if (ownedFilter === "no" && itemOwned(egoBitsets, ego)) return false;
                    if (ownedFilter === "wish" && !wishlist.includes(`e${ego.id}`)) return false;
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

        if (activeTabs.includes("announcer")) {
            const items = filterByFilters("announcer",
                Object.values(announcers),
                [...filters, ...addedFilters],
                announcer => {
                    if (announcer.hidden) return false;
                    if (searchString.length > 0 && !checkFilterMatch(searchString, [announcer.name])) return false;
                    if (ownedFilter === "yes" && !announcerItemOwned(announcerBitset, announcer)) return false;
                    if (ownedFilter === "no" && announcerItemOwned(announcerBitset, announcer)) return false;
                    if (ownedFilter === "wish" && !wishlist.includes(`a${announcer.id}`)) return false;
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

        if (activeTabs.includes("facade")) {
            const items = filterByFilters("facade",
                Object.values(facades),
                [...filters, ...addedFilters],
                facade => {
                    const offset = facade.facadeOnly ? 12 : 0;
                    const searchNames = [facade.name];
                    if (!altNamesLoading && facade.id in altNames) searchNames.push(...altNames[facade.id]);
                    if (searchString.length > 0 && !checkFilterMatch(searchString, searchNames)) return false;
                    if (ownedFilter === "yes" && !itemOwned(facadeBitsets, facade, offset)) return false;
                    if (ownedFilter === "no" && itemOwned(facadeBitsets, facade, offset)) return false;
                    if (ownedFilter === "wish" && !wishlist.includes(`f${facade.id}`)) return false;
                    if (!filterFunction(facade)) return false;
                    return true;
                },
                strict
            );

            items.forEach(facade => {
                totalCount += 1;
                const offset = facade.facadeOnly ? 12 : 0;
                if (itemOwned(facadeBitsets, facade, offset)) count += 1;
            });

            filtered.push(...items.map(x => ["facade", x]));
        }

        const sortFunctionsB = [
            ([a], [b]) => {
                if (a === b) return 0;
                if (a === "id") return -1;
                if (b === "id") return 1;
                if (a === "ego") return -1;
                if (b === "ego") return 1;
                if (a === "announcer") return -1;
                if (b === "announcer") return 1;
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
        identityBitsets, egoBitsets, announcerBitset, facadeBitsets,
        identities, egos, announcers, facades, wishlist,
        activeTabs, ownedFilter, separateSinners, searchString,
        filters, altNames, altNamesLoading,
        advOptsMode, advOpts
    ]);

    const contentDisplay = () => {
        const listToComponents = list =>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 92 : 128}px, 1fr))`, width: "100%", gap: "0.5rem" }}>
                {list.map(([t, obj]) => {
                    const key = `${t[0]}${obj.id}`;

                    return t === "id" ?
                        <IdentityDisplay key={key}
                            identity={obj} identityBitsets={identityBitsets}
                            setIdentityBitsets={setIdentityBitsets} editable={editable}
                            wishlistToggled={wishlistToggled} wishlist={wishlist} setWishlist={setWishlist} wishlistKey={key}
                            data={obj} advancedOptions={advOpts}
                        /> :
                        t === "ego" ?
                            <EgoDisplay key={key}
                                ego={obj} egoBitsets={egoBitsets}
                                setEgoBitsets={setEgoBitsets} editable={editable}
                                wishlistToggled={wishlistToggled} wishlist={wishlist} setWishlist={setWishlist} wishlistKey={key}
                                data={obj} advancedOptions={advOpts}
                            /> :
                            t === "announcer" ?
                                <AnnouncerDisplay key={key}
                                    announcer={obj} announcerBitset={announcerBitset}
                                    setAnnouncerBitset={setAnnouncerBitset} editable={editable}
                                    wishlistToggled={wishlistToggled} wishlist={wishlist} setWishlist={setWishlist} wishlistKey={key}
                                /> :
                                t === "facade" ?
                                    <FacadeDisplay key={key}
                                        facade={obj} facadeBitsets={facadeBitsets}
                                        setFacadeBitsets={setFacadeBitsets} editable={editable}
                                        wishlistToggled={wishlistToggled} wishlist={wishlist} setWishlist={setWishlist} wishlistKey={key}
                                    /> :
                                    null
                })}
            </div>

        if (separateSinners) {
            return <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                {Object.entries(items).map(([sinnerId, list]) => [
                    sinnerId !== "99" ?
                        <div key={sinnerId} style={{ display: "flex", flexDirection: "row", alignItems: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                            <SinnerIcon num={sinnerId} style={{ width: "48px", height: "48px" }} />
                            {sinnerIdMapping[sinnerId]}
                        </div> :
                        <div key={"announcer"} style={{ display: "flex", alignItems: "center", fontSize: "1.2rem", height: "48px", fontWeight: "bold" }}>
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
            Object.entries(items).map(([, list]) => list).reduce((acc, list) => { acc.push(...list); return acc; }, []) : items;
        const newIdBitsets = [...identityBitsets];
        const newEgoBitsets = [...egoBitsets];
        let newAnnouncerBitset = announcerBitset;
        const newFacadeBitsets = [...facadeBitsets];

        list.forEach(([t, obj]) => {
            if (t === "id")
                newIdBitsets[obj.sinnerId - 1] = setFlag(newIdBitsets[obj.sinnerId - 1], obj);
            else if (t === "ego")
                newEgoBitsets[obj.sinnerId - 1] = setFlag(newEgoBitsets[obj.sinnerId - 1], obj);
            else if (t === "announcer")
                newAnnouncerBitset = announcerSetFlag(newAnnouncerBitset, obj);
            else if (t === "facade") {
                const offset = obj.facadeOnly ? 12 : 0
                newFacadeBitsets[obj.sinnerId - 1 + offset] = setFlag(newFacadeBitsets[obj.sinnerId - 1 + offset], obj);
            }
        })

        setIdentityBitsets(newIdBitsets);
        setEgoBitsets(newEgoBitsets);
        setAnnouncerBitset(newAnnouncerBitset);
        setFacadeBitsets(newFacadeBitsets);
    }

    const unsetAllFiltered = () => {
        const list = separateSinners ?
            Object.entries(items).map(([, list]) => list).reduce((acc, list) => { acc.push(...list); return acc; }, []) : items;
        const newIdBitsets = [...identityBitsets];
        const newEgoBitsets = [...egoBitsets]
        let newAnnouncerBitset = announcerBitset;
        const newFacadeBitsets = [...facadeBitsets];

        list.forEach(([t, obj]) => {
            if (t === "id")
                newIdBitsets[obj.sinnerId - 1] = unsetFlag(newIdBitsets[obj.sinnerId - 1], obj);
            else if (t === "ego")
                newEgoBitsets[obj.sinnerId - 1] = unsetFlag(newEgoBitsets[obj.sinnerId - 1], obj);
            else if (t === "announcer")
                newAnnouncerBitset = announcerUnsetFlag(newAnnouncerBitset, obj);
            else if (t === "facade") {
                const offset = obj.facadeOnly ? 12 : 0
                newFacadeBitsets[obj.sinnerId - 1 + offset] = unsetFlag(newFacadeBitsets[obj.sinnerId - 1 + offset], obj);
            }
        })

        setIdentityBitsets(newIdBitsets);
        setEgoBitsets(newEgoBitsets);
        setAnnouncerBitset(newAnnouncerBitset);
        setFacadeBitsets(newFacadeBitsets);
    }

    const createTab = (key, label) => <div
        className={`${styles.tab} ${activeTabs.includes(key) ? styles.active : null}`}
        onClick={() => {
            if (activeTabs.includes(key)) setActiveTabs(p => p.filter(x => x !== key));
            else setActiveTabs(p => ([...p, key]));
            setAdvOpts([]);
        }}>
        {label}
    </div>

    const handleLinkCopy = async () => {
        if (!username) return;
        try {
            await navigator.clipboard.writeText(encodeURI(`${SITE_ROOT}/profiles/${username}?tab=company`));
            setHintText('Copied!');
            setTimeout(() => setHintText(null), 1500);
        } catch (err) {
            setHintText('Failed to copy!');
            setTimeout(() => setHintText(null), 1500);
            console.error('Failed to copy text: ', err);
        }
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem", width: "100%" }}>
        {editable && <div style={{ display: "flex", alignItems: "center", alignSelf: "center", gap: "0.2rem" }}>
            {username &&
                <HintText hintText={hintText}>
                    <button onClick={handleLinkCopy}>
                        Copy Share Link
                    </button>
                </HintText>
            }
            <button onClick={() => setForceSave(true)}>
                Save Changes
            </button>
            <div>
                {saveString}
            </div>
        </div>}
        <h2 style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Display:</span>
            {createTab("id", "Identities")}
            {createTab("ego", "E.G.Os")}
            {createTab("announcer", "Announcers")}
            {createTab("facade", "Façades")}
        </h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.1rem", alignItems: "center" }}>
            <input type="text" placeholder="Search..." value={searchString} onChange={(e) => setSearchString(e.target.value)} />
            <DropdownButton value={ownedFilter} setValue={setOwnedFilter} options={filterOptions} />
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
                <button 
                    onClick={() => setWishlistToggled(p => !p)}
                    {...getGeneralMarkdownTooltipProps("Mark items you plan to get in the future to make them easier to remember.")}
                >
                    {wishlistToggled ? "Disable" : "Enable"} Wishlist Editing
                </button>
            </>
            }
        </div>

        <IconsSelector type={"row"} values={filters} setValues={setFilters} borderless={true}
            categories={filterCategories}
        />

        <AdvancedOptionsSelector mode={advOptsMode} options={advOpts} setOptions={setAdvOpts} noCompany={true} />

        <span style={{ fontWeight: "bold", alignSelf: "center", fontSize: "1.2rem" }}>
            Owned Stats: {count}/{totalCount}{totalCount > 0 ? ` (${(100 * count / totalCount).toFixed(2)})%` : ""}
        </span>

        {contentDisplay()}
    </div>
}

export default function CompanyDisplay({ username, editable = false }) {
    const { user, profile, loading } = useAuth();
    const [identities, identitiesLoading] = useData("identities");
    const [egos, egosLoading] = useData("egos");
    const [announcers, announcersLoading] = useData("announcers");
    const [facades, facadesLoading] = useData("facades");
    const [identityBitsets, setIdentityBitsets] = useState([]);
    const [egoBitsets, setEgoBitsets] = useState([]);
    const [announcerBitset, setAnnouncerBitset] = useState(null);
    const [facadeBitsets, setFacadeBitsets] = useState([]);
    const [wishlist, setWishlist] = useState([]);
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
                    setFacadeBitsets(Array.from({ length: 24 }, () => bitsetFunctions.newMask(0)));
                    setWishlist([]);
                } else {
                    setNotSet(true);
                }
            } else {
                setIdentityBitsets(company.identities.map(mask => bitsetFunctions.fromString(mask)));
                setEgoBitsets(company.egos.map(mask => bitsetFunctions.fromString(mask)));
                setAnnouncerBitset(bitsetFunctions.fromString(company.announcers));
                if (company.facades) setFacadeBitsets(company.facades.map(mask => bitsetFunctions.fromString(mask)));
                else setFacadeBitsets(Array.from({ length: 24 }, () => bitsetFunctions.newMask(0)));
                setWishlist(company.wishlist);
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
                announcers: bitsetFunctions.toString(announcerBitset),
                facades: facadeBitsets.map(bitset => bitsetFunctions.toString(bitset)),
                wishlist: wishlist
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
    }, [identityBitsets, egoBitsets, announcerBitset, facadeBitsets, wishlist, changed, user, editable, forceSave, firstSave]);

    const saveString = useMemo(() => {
        if (saveStatus === "idle") return null;
        if (saveStatus === "saving") return "Saving changes";
        if (saveStatus === "saved") return <div>Last Saved: <ReactTimeAgo date={lastSaved} locale="en-US" timeStyle="mini" /> ago</div>;
        if (saveStatus === "error") return "Unable to save changes";
        return null;
    }, [saveStatus, lastSaved]);

    if (loading || contentLoading || identitiesLoading || egosLoading || announcersLoading || facadesLoading) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;
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

    const handleSetFacadeBitsets = newBitsets => {
        if (!editable) return;
        setChanged(true);
        setFacadeBitsets(newBitsets);
    }

    const handleSetWishlist = newWishlist => {
        if (!editable) return;
        setChanged(true);
        setWishlist(newWishlist);
    }

    return <CompanyDisplayMain
        username={profile?.username}
        identityBitsets={identityBitsets} setIdentityBitsets={handleSetIdentityBitsets}
        egoBitsets={egoBitsets} setEgoBitsets={handleSetEgoBitsets}
        announcerBitset={announcerBitset} setAnnouncerBitset={handleSetAnnouncerBitset}
        facadeBitsets={facadeBitsets} setFacadeBitsets={handleSetFacadeBitsets}
        wishlist={wishlist} setWishlist={handleSetWishlist}
        identities={identities} egos={egos} announcers={announcers} facades={facades}
        editable={editable} setForceSave={setForceSave} saveString={saveString}
    />
}