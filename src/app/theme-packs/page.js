"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useCallback, useMemo, useState } from "react";
import Select from "react-select";

import styles from "./themePacks.module.css";
import { useData } from "../components/DataProvider";
import Gift from "../components/gifts/Gift";
import HoverBlocker from "../components/HoverBlocker";
import MarkdownRenderer from "../components/markdown/MarkdownRenderer";
import ThemePackWithFloors from "../components/objects/ThemePackWithFloors";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { checkFilterMatch } from "../lib/filter";
import useLocalState from "../lib/useLocalState";
import { selectStyle } from "../styles/selectStyle";

function ThemePack({ id, themePack, isSmall, viewMode, openOverride = false }) {
    const [open, setOpen] = useState(false);
    const [blockHover, setBlockHover] = useState(false);

    const isOpen = open || openOverride;

    return <div
        className={`${styles.themePackCard} ${!blockHover && !openOverride ? styles.canHover : null}`}
        onClick={() => { if (!blockHover && !openOverride) setOpen(p => !p) }}
        style={{ minHeight: isSmall ? "250px" : "400px" }}
    >
        <div className={styles.themePackCardTopContainer}>
            <div style={{ height: "fit-content", boxSizing: "border-box" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "3px" }}>
                    <ThemePackWithFloors id={id} scale={isSmall ? 0.3 : 0.5} />
                </div>
            </div>
            {isOpen ?
                (
                    themePack["exclusive_gifts"] ?
                        <div style={{ display: "grid", gridAutoFlow: "column", gridTemplateRows: `repeat(${isSmall ? 5 : 4}, 1fr)` }}>
                            {
                                themePack["exclusive_gifts"].map((gift, i) =>
                                    <HoverBlocker key={gift} setBlockHover={setBlockHover}>
                                        <Gift key={i} id={gift} scale={isSmall ? .5 : 1} />
                                    </HoverBlocker>
                                )
                            }
                        </div> :
                        "No exclusive gifts"
                )
                : null
            }
        </div>
        {isOpen ?
            <React.Fragment>
                <div style={{ border: "1px #777 solid" }} />
                {
                    themePack["bossEncounters"] ?
                        <div style={{ display: "flex", flexDirection: "column", justifySelf: "start" }}>
                            <span>Possible Bosses:</span>
                            {themePack["bossEncounters"].map(enc => <HoverBlocker key={enc} setBlockHover={setBlockHover}>
                                <MarkdownRenderer content={`{enc:${enc}}`} />
                            </HoverBlocker>)}
                        </div> :
                        <div style={{ textAlign: "center" }}>
                            Boss data to be added
                        </div>
                }
            </React.Fragment> :
            null
        }
    </div>
}

function CategorySelector({ selected, setSelected, categories }) {
    const [options, toOption] = useMemo(() => {
        const list = [];
        const reverse = {};

        Object.entries(categories).forEach(([category, innerCategories]) => {
            const obj = { value: category, label: category, name: category };
            list.push(obj);
            reverse[category] = obj;

            innerCategories.forEach(innerCategory => {
                const name = `${category}: ${innerCategory}`;
                const innerObj = { value: innerCategory, label: name, name: name };
                list.push(innerObj);
                reverse[innerCategory] = innerObj;
            })
        })

        return [list, reverse];
    }, [categories]);

    return <Select
        isMulti={true}
        isClearable={true}
        options={options}
        value={selected.map(id => toOption[id])}
        onChange={v => setSelected(v.map(x => x.value))}
        placeholder={"Select categories..."}
        filterOption={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
        styles={selectStyle}
    />;
}

function FloorSelector({ selected, setSelected, floors }) {
    const [options, toOption] = useMemo(() => {
        const list = [];
        const reverse = {};

        Object.entries(floors).forEach(([d, f]) => {
            const capD = d.charAt(0).toUpperCase() + d.slice(1);
            Object.keys(f).forEach(floor => {
                const obj = { value: `${d}|${floor}`, label: `${capD}: F${floor}`, name: `${capD}: F${floor}` };
                list.push(obj);
                reverse[obj.value] = obj;
            });
        }, []);

        return [list, reverse];
    }, [floors])

    return <Select
        isMulti={true}
        isClearable={true}
        options={options}
        value={selected.map(id => toOption[id])}
        onChange={v => setSelected(v.map(x => x.value))}
        placeholder={"Select floors..."}
        filterOption={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
        styles={selectStyle}
    />;
}

export default function ThemePacksPage() {
    const [themePacksData, themePacksLoading] = useData("md_theme_packs");
    const [floorPacksData, floorPacksLoading] = useData("md_floor_packs");
    const [giftsData, giftsLoading] = useData("gifts");
    const { isDesktop } = useBreakpoint();

    const [searchString, setSearchString] = useState("");
    const [includeGifts, setIncludeGifts] = useLocalState("themePacksIncludeGifts", true);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedFloors, setSelectedFloors] = useState([]);

    const [forceOpen, setForceOpen] = useLocalState("themePacksForceOpen", false);

    const filterStrings = useMemo(() => {
        if (themePacksLoading || giftsLoading) return;
        return Object.entries(themePacksData).reduce((acc, [id, themePack]) => {
            acc[id] = [themePack.name];
            if (themePack.exclusive_gifts) acc[id].push(...themePack.exclusive_gifts.map(x => giftsData[x].names[0]))
            return acc;
        }, {});
    }, [themePacksData, themePacksLoading, giftsData, giftsLoading]);

    const categories = useMemo(() =>
        Object.values(themePacksLoading ? {} : themePacksData).reduce((acc, themePack) => {
            if (!(themePack.category[0] in acc))
                acc[themePack.category[0]] = []
            if (themePack.category.length === 2 && !acc[themePack.category[0]].includes(themePack.category[1]))
                acc[themePack.category[0]].push(themePack.category[1])
            return acc;
        }, {}),
        [themePacksData, themePacksLoading]
    );

    const checkFloorMatch = useCallback((floor, id) => {
        if (floorPacksLoading) return false;
        const [d, f] = floor.split("|");
        return floorPacksData[d][f].includes(id);
    }, [floorPacksData, floorPacksLoading]);

    const components = useMemo(() =>
        themePacksLoading ? [] :
            Object.entries(themePacksData).filter(([id, themePack]) => {
                if (selectedCategories.length !== 0 && !selectedCategories.some(selectedCategory => themePack.category.includes(selectedCategory))) return false;
                if (selectedFloors.length !== 0 && !selectedFloors.some(selectedFloor => checkFloorMatch(selectedFloor, id))) return false;
                if (searchString.length !== 0 && !checkFilterMatch(searchString, includeGifts ? filterStrings[id] : themePack.name)) return false;
                return true;
            }).map(([id, themePack]) => <ThemePack key={id} id={id} themePack={themePack} isSmall={!isDesktop} openOverride={forceOpen} />)
        , [themePacksData, themePacksLoading, searchString, filterStrings, selectedCategories, selectedFloors, checkFloorMatch, includeGifts, isDesktop, forceOpen]);

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "1rem", justifyContent: "start" }}>
        <h2 style={{ margin: 0 }}>Theme Packs</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <span style={{ fontWeight: "bold", textAlign: "end" }}>Search</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "start" }}>
                <input value={searchString} onChange={e => setSearchString(e.target.value)} placeholder={"Search name..."} />
                <label>
                    <input type="checkbox" checked={includeGifts} onChange={e => setIncludeGifts(e.target.checked)} />
                    <span {...getGeneralTooltipProps("This will check the names of the exclusive gifts that can be obtained from the theme pack.")}
                        style={{ borderBottom: "1px #aaa dotted", cursor: "help" }}
                    >
                        Include Gifts
                    </span>
                </label>
            </div>
            <span style={{ textAlign: "end" }}>Filter Categories:</span>
            <CategorySelector
                selected={selectedCategories}
                setSelected={setSelectedCategories}
                categories={categories}
            />
            <span style={{ textAlign: "end" }}>Filter Floors:</span>
            <FloorSelector
                selected={selectedFloors}
                setSelected={setSelectedFloors}
                floors={floorPacksLoading ? {} : floorPacksData}
            />
            <div />
            <label>
                <input type="checkbox" checked={forceOpen} onChange={e => setForceOpen(e.target.checked)} />
                <span {...getGeneralTooltipProps("Force all theme packs to show their exclusive gifts")}
                    style={{ borderBottom: "1px #aaa dotted", cursor: "help" }}
                >
                    Force Open all Theme Packs
                </span>
            </label>
        </div>
        <div style={{ border: "1px #777 solid", width: "100%" }} />
        {themePacksLoading || giftsLoading ?
            <div style={{ textAlign: "center", fontSize: "1.5rem" }}>Loading Theme Packs...</div> :
            <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "0.25rem" }}>
                <h3 style={{ margin: 0 }}>Results: {components.length}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem" }}>
                    {components}
                </div>
            </div>
        }
    </div>;
}
