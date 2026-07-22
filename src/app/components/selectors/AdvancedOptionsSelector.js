import { FactionDropdownSelector } from "./FactionSelectors";
import { SeasonDropdownSelector } from "./SeasonSelectors";
import Icon from "../icons/Icon";
import KeywordIcon from "../icons/KeywordIcon";
import DropdownButton from "../objects/DropdownButton";
import NumberInput from "../objects/NumberInput";

import { ColoredResistance } from "@/app/lib/colors";
import { affinities, LEVEL_CAP } from "@/app/lib/constants";
import { selectStyleSmall } from "@/app/styles/selectStyle";

const allOptionTypes = {
    "strict": "Strict Filtering"
}

const bothOptionTypes = {
    "season": "Season Filter",
    "strict": "Strict Filtering"
}

const advancedOptionTypes = {
    "sort": "Sort",
    "filter": "Filter",
    "season": "Season Filter",
    "strict": "Strict Filtering"
    // "passive": "Show Passives"
}

const identityAdvancedOptionTypes = {
    "faction": "Faction Filter"
}

const announcerAdvancedOptionTypes = {
    "walpurgis": "Walpurgis",
    "ideality": "Ideality"
}

const advancedOptionStyle = {
    display: "flex", gap: "0.1rem", alignItems: "center",
    border: "1px var(--secondary-border-color) solid",
    borderRadius: "0.5rem", padding: "0.2rem 0.2rem"
};

const identityParams = {
    "hp": "Max HP (Max Level)",
    "min-speed": "Min Speed (Max Uptie)",
    "max-speed": "Max Speed (Max Uptie)",
    "staggers": "Stagger Thresholds",
    "def": "Defense Level (Max Level)",
    "slash": "Slash Resist",
    "pierce": "Pierce Resist",
    "blunt": "Blunt Resist"
}

const egoParams = {
    "cost": "Sin Cost",
    "resist": "Sin Resist"
}

const conds = {
    "lt": "<",
    "gt": ">",
    "le": "≤",
    "ge": "≥",
    "eq": "="
}

const identityExtractParams = {
    "hp": data => Math.round(data.hp.base + LEVEL_CAP * data.hp.level),
    "min-speed": data => data.speedList[data.speedList.length - 1][0],
    "max-speed": data => data.speedList[data.speedList.length - 1][1],
    "staggers": data => data.breakSection.length,
    "def": data => LEVEL_CAP + data.defCorrection,
    "slash": data => data.resists.slash,
    "pierce": data => data.resists.pierce,
    "blunt": data => data.resists.blunt,
}

const labelStyle = { display: "flex", alignItems: "center", gap: "0.2rem" };

const identityParamLabels = {
    "hp": (key, data) => <div key={key} style={labelStyle}>
        <Icon path={"hp"} style={{ width: "32px", height: "32px" }} />
        <span>{identityExtractParams["hp"](data)}</span>
    </div>,
    "min-speed": (key, data) => <div key={key} style={labelStyle}>
        min <Icon path={"speed"} style={{ width: "32px", height: "32px" }} />
        <span>{identityExtractParams["min-speed"](data)}</span>
    </div>,
    "max-speed": (key, data) => <div key={key} style={labelStyle}>
        max <Icon path={"speed"} style={{ width: "32px", height: "32px" }} />
        <span>{identityExtractParams["max-speed"](data)}</span>
    </div>,
    "staggers": (key, data) => <div key={key} style={labelStyle}>
        Staggers
        <span>{identityExtractParams["staggers"](data)}</span>
    </div>,
    "def": (key, data) => <div key={key} style={labelStyle}>
        <Icon path={"defense level"} style={{ width: "32px", height: "32px" }} />
        <span>{identityExtractParams["def"](data)}</span>
    </div>,
    "slash": (key, data) => <div key={key} style={labelStyle}>
        <KeywordIcon id={"Slash"} />
        <span><ColoredResistance resist={identityExtractParams["slash"](data)} /></span>
    </div>,
    "pierce": (key, data) => <div key={key} style={labelStyle}>
        <KeywordIcon id={"Pierce"} />
        <span><ColoredResistance resist={identityExtractParams["pierce"](data)} /></span>
    </div>,
    "blunt": (key, data) => <div key={key} style={labelStyle}>
        <KeywordIcon id={"Blunt"} />
        <span><ColoredResistance resist={identityExtractParams["blunt"](data)} /></span>
    </div>,
}

const egoExtractParams = {
    "cost": (data, affinity) => data.cost[affinity] ?? 0,
    "resist": (data, affinity) => data.resists[affinity]
}

const egoParamLabels = {
    "cost": (key, data, affinity) => {
        const value = egoExtractParams["cost"](data, affinity);
        return <div key={key} style={labelStyle}>
            <Icon path={affinity} style={{ width: "32px" }} /> cost
            <span style={value === 0 ? { color: "var(--disabled-text-color)" } : {}}>x{value}</span>
        </div>
    },
    "resist": (key, data, affinity) => <div key={key} style={labelStyle}>
        <Icon path={affinity} style={{ width: "32px" }} /> resist
        <ColoredResistance resist={egoExtractParams["resist"](data, affinity)} />
    </div>
}

const dropdownStyle = {
    border: "1px solid transparent",
    padding: "0",
    fontSize: "0.9rem"
}

function AdvancedOption({ mode, type, param, affinity, order, cond, value, faction, season, setOptionParam, removeOption }) {
    const options =
        mode === "all" ?
            allOptionTypes :
            mode === "both" ?
                bothOptionTypes :
                mode === "announcer" ?
                    announcerAdvancedOptionTypes :
                    { ...advancedOptionTypes, ...(mode === "id" ? identityAdvancedOptionTypes : {}) }

    const typeDropdown = <DropdownButton
        value={type} setValue={x => setOptionParam("type", x)}
        options={options} defaultDisplay={"Choose an option"}
        styleOverride={dropdownStyle}
    />

    const remButton = <button onClick={removeOption} style={dropdownStyle}>✕</button>

    if (type === "sort")
        return <div style={advancedOptionStyle}>
            {typeDropdown}
            <span style={{ fontWeight: "bold" }}>:</span>
            <DropdownButton value={param} setValue={x => setOptionParam("param", x)}
                options={mode === "id" ? identityParams : egoParams} defaultDisplay={"Stat"}
                styleOverride={dropdownStyle}
            />
            {mode === "ego" &&
                <DropdownButton value={affinity} setValue={x => setOptionParam("affinity", x)}
                    options={Object.fromEntries(affinities.map(x => [x, x]))} defaultDisplay={"Affinity"}
                    styleOverride={dropdownStyle}
                />
            }
            <DropdownButton value={order} setValue={x => setOptionParam("order", x)}
                options={{ "asc": "Ascending", "desc": "Descending" }} defaultDisplay={"Order"}
                styleOverride={dropdownStyle}
            />
            {remButton}
        </div>

    if (type === "filter")
        return <div style={advancedOptionStyle}>
            {typeDropdown}
            <span style={{ fontWeight: "bold" }}>:</span>
            <DropdownButton value={param} setValue={x => setOptionParam("param", x)}
                options={mode === "id" ? identityParams : egoParams} defaultDisplay={"Stat"}
                styleOverride={dropdownStyle}
            />
            {mode === "ego" &&
                <DropdownButton value={affinity} setValue={x => setOptionParam("affinity", x)}
                    options={Object.fromEntries(affinities.map(x => [x, x]))} defaultDisplay={"Affinity"}
                    styleOverride={dropdownStyle}
                />
            }
            <DropdownButton value={cond} setValue={x => setOptionParam("cond", x)}
                options={conds} defaultDisplay={"Condition"}
                styleOverride={dropdownStyle}
            />
            <NumberInput
                value={value ?? 0} onChange={x => setOptionParam("value", x)} allowEmpty={true}
                style={{ width: "4ch", textAlign: "center", fontSize: "0.9rem", padding: "0" }}
            />
            {remButton}
        </div>

    if (type === "faction") {
        return <div style={advancedOptionStyle}>
            {typeDropdown}
            <span style={{ fontWeight: "bold" }}>:</span>
            <FactionDropdownSelector selected={faction} setSelected={x => setOptionParam("faction", x)} styles={selectStyleSmall} />
            {remButton}
        </div>
    }

    if (type === "season") {
        return <div style={advancedOptionStyle}>
            {typeDropdown}
            <span style={{ fontWeight: "bold" }}>:</span>
            <SeasonDropdownSelector selected={season} setSelected={x => setOptionParam("season", x)} styles={selectStyleSmall} />
            {remButton}
        </div>
    }

    return <div style={advancedOptionStyle}>
        {typeDropdown}
        {remButton}
    </div>;
}

export default function AdvancedOptionsSelector({ mode, options, setOptions }) {
    const addAdvancedOption = () => {
        setOptions(p => [...p, { type: null }])
    }

    const setOptionParam = (i, key, value) => {
        setOptions(p => p.map((x, ind) => ind === i ? { ...x, [key]: value } : x));
    }

    return <div style={{ display: "flex", flexWrap: "wrap", gap: "0.1rem", alignItems: "center" }}>
        <button style={{ fontSize: "0.9rem" }} onClick={() => addAdvancedOption()}>Add Advanced Option</button>
        {options.map((x, i) =>
            <AdvancedOption key={i} mode={mode} {...x}
                setOptionParam={(k, v) => setOptionParam(i, k, v)}
                removeOption={() => setOptions(p => p.filter((y, ind) => ind !== i))}
            />
        )}
    </div>
}

export function getFilterSortAdvancedOptionsData(mode, advancedOptions) {
    const compare = (v1, v2, cond) => {
        if (cond === "lt") return v1 < v2;
        if (cond === "gt") return v1 > v2;
        if (cond === "le") return v1 <= v2;
        if (cond === "ge") return v1 >= v2;
        if (cond === "eq") return v1 === v2;
        return true;
    }

    const strict = advancedOptions.some(opt => opt.type === "strict");

    const addedFilters = advancedOptions.reduce((f, opt) => {
        if (opt.type === "faction" && opt.faction !== undefined && opt.faction !== null) f.push(["tag", opt.faction]);
        if (opt.type === "season" && opt.season !== undefined && opt.season !== null) f.push(["season", opt.season]);
        return f
    }, []);

    const filterFunction = data => {
        if (advancedOptions.every(opt => {
            if (opt.type === "filter") {
                if (mode === "id") {
                    if (opt.param === undefined || opt.cond === undefined) return true;
                    const v = identityExtractParams[opt.param](data);
                    return compare(v, opt.value ?? 0, opt.cond);
                } else if (mode === "ego") {
                    if (opt.param === undefined || opt.affinity === undefined || opt.cond === undefined) return true;
                    const v = egoExtractParams[opt.param](data, opt.affinity);
                    return compare(v, opt.value ?? 0, opt.cond);
                }
            }
            if (opt.type === "walpurgis" && mode === "announcer") {
                return data.walpurgis;
            }
            if (opt.type === "ideality" && mode === "announcer") {
                return data.ideality;
            }
            return true;
        })) return true;
        return false;
    }

    const sortFunctions = [];

    advancedOptions.filter(({ type }) => type === "sort").forEach(({ param, affinity, order }) => {
        if (mode === "id" && (param === undefined || order === undefined)) return;
        if (mode === "ego" && (param === undefined || affinity === undefined || order === undefined)) return;
        sortFunctions.push((a, b) => {
            const va = (mode === "id" ? identityExtractParams[param](a) : egoExtractParams[param](a, affinity));
            const vb = (mode === "id" ? identityExtractParams[param](b) : egoExtractParams[param](b, affinity));
            if (order === "asc") return va - vb;
            if (order === "desc") return vb - va;
            return 0;
        });
    })

    return { strict, addedFilters, filterFunction, sortFunctions };
}

export function AdvancedOptionsLabels({ mode, advancedOptions, data }) {
    if (mode === "id") {
        return advancedOptions
            .filter(({ type, param }) => ["sort", "filter"].includes(type) && param)
            .map((opt, i) => identityParamLabels[opt.param](i, data))
    } else if (mode === "ego") {
        return advancedOptions
            .filter(({ type, param, affinity }) => ["sort", "filter"].includes(type) && param && affinity)
            .map((opt, i) => egoParamLabels[opt.param](i, data, opt.affinity))
    } else {
        return null;
    }
} 