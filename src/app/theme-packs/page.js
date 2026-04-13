"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useMemo, useState } from "react";
import Select from "react-select";

import { useFloorsPerPack } from "../components/dataHooks/mdFloors";
import { useData } from "../components/DataProvider";
import Gift from "../components/gifts/Gift";
import ThemePackIcon from "../components/icons/ThemePackIcon";
import { checkFilterMatch } from "../lib/filter";
import { selectStyle } from "../styles/selectStyle";


const formatExclusiveGifts = (exclusiveGifts, isSmall) => {
    return <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        {exclusiveGifts.map((gift, i) => <Gift key={i} id={gift} scale={isSmall ? .5 : 1} />)}
    </div>
}

function ThemePack({ themePack, normal, hard, isSmall }) {
    return <div style={{
        display: "grid", gridTemplateColumns: `${isSmall ? 120 : 200}px 1fr`, gridAutoRows: "auto",
        alignItems: "start", height: "auto", minWidth: isSmall ? "320px" : "640px", padding: "3px",
        boxSizing: "border-box", border: "1px grey dotted"
    }}>
        <div style={{ height: "fit-content", boxSizing: "border-box" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "3px" }}>
                <ThemePackIcon themePack={themePack} displayName={true} scale={isSmall ? .3 : .5} />
            </div>
        </div>

        <div style={{ display: "grid", height: "100%", gridTemplateRows: "4fr 1fr", boxSizing: "border-box" }}>
            <div style={{ flex: "3", borderBottom: "1px grey dotted", alignItems: "start", padding: "5px" }}>
                {"exclusive_gifts" in themePack ? formatExclusiveGifts(themePack["exclusive_gifts"], isSmall) : null}
            </div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "start", padding: "5px" }}>
                <div>Floors</div>
                <div>
                    <span style={{ color: "#4ade80" }}>Normal: </span>
                    <span>{normal ? normal.join(", ") : "None"}</span>
                </div>
                <div>
                    <span style={{ color: "#f87171" }}>Hard: </span>
                    <span>{hard ? hard.join(", ") : "None"}</span>
                </div>
            </div>
        </div>
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

export default function ThemePacksPage() {
    const [themePacksData, themePacksLoading] = useData("md_theme_packs");
    const { isDesktop } = useBreakpoint();

    const floorsPerPack = useFloorsPerPack();

    const [selectedCategories, setSelectedCategories] = useState([]);

    const components = [];

    Object.entries(themePacksLoading ? {} : themePacksData).forEach(([id, themePack]) => {
        if (selectedCategories.length !== 0 && !selectedCategories.some(selectedCategory => themePack.category.includes(selectedCategory))) return;

        components.push(<ThemePack key={id} themePack={themePack} normal={floorsPerPack.normal[id]} hard={floorsPerPack.hard[id]} isSmall={!isDesktop} />);
    })

    const categories = {};
    Object.values(themePacksLoading ? {} : themePacksData).forEach(themePack => {
        if (!(themePack.category[0] in categories))
            categories[themePack.category[0]] = []
        if (themePack.category.length === 2 && !categories[themePack.category[0]].includes(themePack.category[1]))
            categories[themePack.category[0]].push(themePack.category[1])
    });

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "1rem", justifyContent: "start" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", textAlign: "start" }}>
            <span>Filter Categories:</span>
            <CategorySelector
                selected={selectedCategories}
                setSelected={setSelectedCategories}
                categories={categories}
            />
        </div>
        <div style={{ width: "100%" }}>
            <div style={{
                display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isDesktop ? 640 : 320}px, 1fr))`,
                width: "100%", boxSizing: "border-box"
            }}>
                {components}
            </div>
        </div>
    </div>;
}
