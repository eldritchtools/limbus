"use client";

import styles from "./IconsSelector.module.css";
import KeywordIcon from "../icons/KeywordIcon";
import RarityIcon from "../icons/RarityIcon";
import SinnerIcon from "../icons/SinnerIcon";

const categoryItems = {
    "identityTier": ["0", "00", "000"],
    "egoTier": ["zayin", "teth", "he", "waw", "aleph"],
    "sinner": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "status": ["Burn", "Bleed", "Tremor", "Rupture", "Sinking", "Poise", "Charge"],
    "affinity": ["wrath", "lust", "sloth", "gluttony", "gloom", "pride", "envy"],
    "skillType": ["Slash", "Pierce", "Blunt", "Guard", "Evade", "Counter"]
}

const additionalCategories = {
    "atkType": ["Slash", "Pierce", "Blunt"],
    "defType": ["Guard", "Evade", "Counter"],
}

export const filterCategories = Object.entries(categoryItems).reduce((acc, [type, list]) => {
    list.forEach(filter => {acc[filter] = type;});
    return acc;
}, {});

function getCategoryItems(category) {
    return categoryItems[category] ?? additionalCategories[category];
}

export default function IconsSelector({ type, categories, values, setValues, borderless=false }) {
    const handleToggle = (filter, selected, excluded) => {
        if (selected)
            setValues(values.map(x => x === filter ? `-${x}` : x));
        else if (excluded)
            setValues(values.filter(x => `-${filter}` !== x));
        else
            setValues([...values, filter]);
    }

    const clearAll = () => {
        setValues([]);
    }

    const toggleComponent = (category, filter) => {
        const selected = values.includes(filter);
        const excluded = !selected && values.includes(`-${filter}`);

        let icon = null;
        switch(category) {
            case "identityTier": 
                icon = <RarityIcon rarity={filter} style={{height: "32px"}} />
                break;
            case "egoTier":
                icon = <RarityIcon rarity={filter} style={{height: "24px"}} />
                break;
            case "sinner":
                icon = <SinnerIcon num={filter} style={{height: "32px", width: "32px"}} />
                break;
            case "status": case "affinity": case "skillType": case "atkType": case "defType":
                icon = <KeywordIcon id={filter} />
                break;
            default:
                break;
        }

        return <div key={filter}
            className={`${styles.iconSelectorButton} ${selected ? styles.selected : null} ${excluded ? styles.excluded : null}`}
            onClick={() => handleToggle(filter, selected, excluded)}
        >
            {icon}
        </div>
    }

    const pieces = [];
    if(type === "column") {
        categories.forEach(category => {
            if(category === "sinner") {
                pieces.push(<div key={category} style={{display: "grid", gridTemplateColumns: "repeat(6, 1fr)", padding: "0.2rem", borderBottom: "1px #777 dotted"}}>
                    {getCategoryItems(category).map(filter => toggleComponent(category, filter))}
                </div>)
            } else {
                pieces.push(<div key={category} style={{display: "flex", justifyContent: "center", padding: "0.2rem", borderBottom: "1px #777 dotted"}}>
                    {getCategoryItems(category).map(filter => toggleComponent(category, filter))}
                </div>)
            }
        })
    } else {
        categories.forEach(category => {
            getCategoryItems(category).forEach(filter => pieces.push(toggleComponent(category, filter)))
        })
    }
    pieces.push(<div key={"clear"} style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={clearAll}>Clear All</div>)

    return <div className={`${styles.iconSelectorContainer} ${type === "row" ? styles.wrappingRow : null} ${type === "column" ? styles.column : null} ${borderless ? styles.borderless : null}`}>
        {pieces}
    </div>
}
