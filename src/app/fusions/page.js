"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useMemo, useState } from "react";

import { useData } from "../components/DataProvider";
import KeywordIcon from "../components/icons/KeywordIcon";
import ThemePackIcon from "../components/icons/ThemePackIcon";
import FusionRecipe from "../components/objects/FusionRecipe";
import ThemePackNameWithTooltip from "../components/objects/ThemePackNameWithTooltip";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import DropdownSelectorWithExclusion from "../components/selectors/DropdownSelectorWithExclusion";
import IconsSelector from "../components/selectors/IconsSelector";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { keywords } from "../lib/constants";
import { checkFilterMatch } from "../lib/filter";
import useLocalState from "../lib/useLocalState";
import { selectStyle } from "../styles/selectStyle";

function getFilterStrings(gift, includeDescription) {
    if (includeDescription) return [gift.names[0], gift.search_desc];
    return gift.names[0];
}

function filterFusionRecipes(gifts, fusionsList, searchString, includeDescription, includeIngredients, selectedKeywords, selectedThemePacks) {
    let list = fusionsList;
    if (searchString !== "")
        list = list.filter(recipe =>
            checkFilterMatch(searchString, getFilterStrings(gifts[recipe.id], includeDescription)) ||
            (includeIngredients &&
                recipe.ingredients.some(ingredient => {
                    if (ingredient instanceof Object)
                        return ingredient.options.some(option => checkFilterMatch(searchString, getFilterStrings(gifts[option], includeDescription)))
                    else
                        return checkFilterMatch(searchString, getFilterStrings(gifts[ingredient], includeDescription))
                })
            )
        );

    if (selectedKeywords.length !== 0) {
        const [inc, exc] = selectedKeywords.reduce(([inc, exc], keyword) => {
            if (keyword[0] === "-") exc.push(keyword.slice(1));
            else inc.push(keyword);
            return [inc, exc];
        }, [[], []]);

        list = list.filter(recipe => {
            const giftKeyword = gifts[recipe.id].keyword;
            if (exc.includes(giftKeyword)) return false;
            if (inc.length === 0) return true;
            return inc.includes(giftKeyword);
        });
    }

    if (selectedThemePacks.length !== 0)
        list = list.filter(recipe => gifts[recipe.id].exclusiveTo ? gifts[recipe.id].exclusiveTo.some(source => selectedThemePacks.includes(source)) : false);

    return list;
}

function FusionRow({ recipe, giftsData, isSmall }) {
    const tdStyle = { borderTop: "1px grey dotted", borderBottom: "1px grey dotted", padding: "5px" };

    return <tr>
        <td style={tdStyle}><FusionRecipe recipe={recipe} scale={isSmall ? .6 : 1} /></td>
        <td style={tdStyle}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", whiteSpace: "pre" }}>
                {giftsData[recipe.id].hardonly ?
                    <div style={{ color: "#f87171" }}>Hard only</div> :
                    <div style={{ minWidth: "3.5rem", color: "#4ade80" }}>Normal or Hard</div>
                }
            </div>
        </td>
        <td style={tdStyle}>
            {giftsData[recipe.id].exclusiveTo ?
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", whiteSpace: "pre" }}>
                    <span>Requires:</span>
                    {giftsData[recipe.id].exclusiveTo.map((source, i) => <ThemePackNameWithTooltip key={i} id={source} />)}
                </div> :
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", whiteSpace: "pre" }}>
                    <span>Always obtainable</span>
                </div>}
        </td>
    </tr>
}

function FusionsDisplay({ searchString, includeDescription, includeIngredients, selectedKeywords, selectedThemePacks, giftsData, isSmall }) {
    const fusionRecipesList = useMemo(() => {
        const list = [];
        Object.entries(giftsData).forEach(([id, gift]) => {
            if (!gift.recipes) return;
            gift.recipes.forEach(recipe => list.push({ id: id, ingredients: recipe }));
        });
        return list;
    }, [giftsData]);

    if (searchString === "" && selectedKeywords.length === 0 && selectedThemePacks.length === 0) {
        const fusionsByKeyword = fusionRecipesList.reduce((acc, fusion) => {
            acc[giftsData[fusion.id].keyword].push(fusion);
            return acc;
        }, keywords.reduce((acc, keyword) => { acc[keyword] = []; return acc }, {}))

        const components = [];
        const tdstyle = { borderTop: "1px grey dotted", borderBottom: "1px grey dotted" }
        const style = { fontSize: "1.5em", fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center" };
        keywords.forEach(keyword => {
            if (fusionsByKeyword[keyword].length === 0) return;
            if (keyword === "Keywordless")
                components.push(<tr key={keyword}><td style={tdstyle} colSpan={3}><div style={style}>Keywordless</div></td></tr>);
            else
                components.push(<tr key={keyword}><td style={tdstyle} colSpan={3}><div style={style}><KeywordIcon id={keyword} scale={1.5} />{keyword}</div></td></tr>);
            fusionsByKeyword[keyword].forEach(recipe => components.push(<FusionRow key={components.length} recipe={recipe} giftsData={giftsData} isSmall={isSmall} />));
        });

        return <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>{components}</tbody></table>
    } else {
        const filteredRecipesList = filterFusionRecipes(giftsData, fusionRecipesList, searchString, includeDescription, includeIngredients, selectedKeywords, selectedThemePacks);
        return <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>{filteredRecipesList.map((recipe, i) => <FusionRow key={i} recipe={recipe} giftsData={giftsData} />)}</tbody></table>
    }
}

function ThemePackSelector({ selected, setSelected, options, themePacksData }) {
    const [optionsFinal, optionsMapped] = useMemo(() => {
        const list = [];
        const mapped = {};
        Object.entries(options).forEach(([category, themePacks]) =>
            themePacks.forEach(id => {
                list.push({
                    value: id,
                    label: <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <ThemePackIcon id={id} scale={.1} />
                        <span>{category}: {themePacksData[id].name}</span>
                    </div>,
                    name: `${category}: ${themePacksData[id].name}`
                });
                mapped[id] = {
                    value: id,
                    label: <div style={{ display: "flex", alignItems: "center" }}>
                        <span>{themePacksData[id].category[0]}: {themePacksData[id].name}</span>
                    </div>
                }
            })
        );
        return [list, mapped];
    }, [options, themePacksData]);

    return <DropdownSelectorWithExclusion
        options={optionsFinal}
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Select Theme Packs..."}
        filterOption={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
        isMulti={true}
        isClearable={true}
        styles={selectStyle}
    />;
}

export default function FusionsPage() {
    const [searchString, setSearchString] = useState("");
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [selectedThemePacks, setSelectedThemePacks] = useState([]);
    const { isDesktop } = useBreakpoint();

    const [giftsData, giftsLoading] = useData("gifts");
    const [themePacksData, themePacksLoading] = useData("md_theme_packs");

    const [includeDescription, setIncludeDescription] = useLocalState("fusionsIncludeDescription", false);
    const [includeIngredients, setIncludeIngredients] = useLocalState("fusionsIncludeIngredients", false);

    const themePackList = useMemo(() => {
        if (giftsLoading || themePacksLoading) return {};

        const fusionThemePacks = new Set();
        Object.entries(giftsData).forEach(([, gift]) => {
            if (!gift.fusion || !("exclusiveTo" in gift)) return;
            gift.exclusiveTo.forEach(source => fusionThemePacks.add(source));
        })

        return Object.entries(themePacksData).reduce((acc, [id, themePack]) => {
            if (!("exclusive_gifts" in themePack) || !fusionThemePacks.has(id))
                return acc;

            if (themePack.category[0] in acc) acc[themePack.category[0]].push(id);
            else acc[themePack.category[0]] = [id];

            return acc;
        }, {});
    }, [giftsData, giftsLoading, themePacksData, themePacksLoading]);

    const handleSearchChange = (e) => {
        setSearchString(e.target.value);
    }

    const fusionsComponent = useMemo(() =>
        !giftsLoading ?
            <FusionsDisplay
                searchString={searchString}
                includeDescription={includeDescription}
                includeIngredients={includeIngredients}
                selectedKeywords={selectedKeywords}
                selectedThemePacks={selectedThemePacks}
                giftsData={giftsData}
                isSmall={!isDesktop}
            /> : null,
        [searchString, includeDescription, includeIngredients, selectedKeywords, selectedThemePacks, giftsData, giftsLoading, isDesktop]
    );

    if (giftsLoading || themePacksLoading) return <LoadingContentPageTemplate />

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "1rem", justifyContent: "center" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Search</span>
                <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <input value={searchString} onChange={handleSearchChange} />
                    <label>
                        <input type="checkbox" checked={includeDescription} onChange={e => setIncludeDescription(e.target.checked)} />
                        <span {...getGeneralTooltipProps("This will check the description for all enhancement levels of the gift.")}
                            style={{ borderBottom: "1px #aaa dotted", cursor: "help" }}
                        >
                            Include Description
                        </span>
                    </label>
                    <label>
                        <input type="checkbox" checked={includeIngredients} onChange={e => setIncludeIngredients(e.target.checked)} />
                        <span {...getGeneralTooltipProps("This will check for the search text in the ingredients as well. Also affected by 'Include Description'.")}
                            style={{ borderBottom: "1px #aaa dotted", cursor: "help" }}
                        >
                            Include Ingredients
                        </span>
                    </label>
                </div>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Filter Keywords</span>
                <IconsSelector type={"row"} categories={["status", "atkType", "keywordless"]} values={selectedKeywords} setValues={setSelectedKeywords} />
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Theme Packs</span>
                <ThemePackSelector
                    selected={selectedThemePacks}
                    setSelected={setSelectedThemePacks}
                    options={themePackList}
                    themePacksData={themePacksData}
                />
            </div>
        </div>
        <div style={{ flex: 1, height: "50%", display: "flex", justifyContent: "center", width: "100%" }}>
            <div style={{ height: "100%", minWidth: "80%", maxWidth: "100%", overflowY: "auto" }}>
                {fusionsComponent}
            </div>
        </div>
    </div>;
}
