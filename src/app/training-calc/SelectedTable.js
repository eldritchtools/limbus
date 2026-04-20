import React, { useState } from "react";

import EgoIcon from "../components/icons/EgoIcon";
import IdentityIcon from "../components/icons/IdentityIcon";
import NumberInputWithButtons from "../components/objects/NumberInputWithButtons";
import UptieSelector from "../components/selectors/UptieSelector";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { uiColors } from "../lib/colors";
import { LEVEL_CAP } from "../lib/constants";
import { checkFilterMatch } from "../lib/filter";
import { getLevelCost, getUptieCost } from "../lib/training";

export default function SelectedTable({ identities, egos, selected, setSelected, starts, setStarts, targets, setTargets }) {
    const [searchString, setSearchString] = useState("");

    const stickyHeaderStyle = { position: "sticky", top: 0, background: "#333", padding: "0.25rem", zIndex: 1 };
    const buttonStyle = { fontWeight: "bold", width: "36px", height: "36px", padding: 0 }

    const getComputedComponents = id => {
        if (`${id}`[0] === "1") {
            let startLevel = starts[id].level ?? starts.default.level;
            let targetLevel = targets[id].level ?? targets.default.level;
            let xp = getLevelCost(startLevel, targetLevel);

            let startUptie = starts[id].uptie ?? starts.default.uptie;
            if (startUptie === "unowned") startUptie = 0;

            const [t, s] = getUptieCost('0'.repeat(identities[id].rank), startUptie, targets[id].uptie ?? targets.default.uptie);

            return <React.Fragment>
                <span>XP: {xp}</span>
                <span>Thread: {t}</span>
                <span>Shards: {s}</span>
            </React.Fragment>
        } else {
            let startUptie = starts[id].uptie ?? starts.default.uptie;
            if (startUptie === "unowned") startUptie = 0;
            const [t, s] = getUptieCost(egos[id].rank, startUptie, targets[id].uptie ?? targets.default.uptie);

            return <React.Fragment>
                <span>Thread: {t}</span>
                <span>Shards: {s}</span>
            </React.Fragment>
        }
    }

    const constructRow = id => {
        return <tr key={id} style={{ borderTop: "1px #777 solid" }}>
            <td>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.1rem" }}>
                    {
                        `${id}`[0] === "1" ?
                            <IdentityIcon id={id} uptie={4} displayName={true} displayRarity={true} /> :
                            <EgoIcon id={id} type={"awaken"} displayName={true} displayRarity={true} />
                    }
                </div>
            </td>
            <td>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.1rem" }}>
                    {
                        `${id}`[0] === "1" ?
                            <NumberInputWithButtons
                                min={1} max={LEVEL_CAP} value={starts[id].level ?? starts.default.level}
                                setValue={v => setStarts(p => ({ ...p, [id]: { ...p[id], level: v } }))}
                                inputStyle={{width: "2ch"}}
                            /> :
                            null
                    }
                    <UptieSelector
                        value={starts[id].uptie ?? starts.default.uptie}
                        setValue={v => setStarts(p => ({ ...p, [id]: { ...p[id], uptie: v } }))}
                        bottomOption={"unowned"}
                    />
                </div>
            </td>
            <td>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.1rem" }}>
                    {
                        `${id}`[0] === "1" ?
                            <NumberInputWithButtons
                                min={1} max={LEVEL_CAP} value={targets[id].level ?? targets.default.level}
                                setValue={v => setTargets(p => ({ ...p, [id]: { ...p[id], level: v } }))}
                                inputStyle={{width: "2ch"}}
                            /> :
                            null
                    }
                    <UptieSelector
                        value={targets[id].uptie ?? targets.default.uptie}
                        setValue={v => setTargets(p => ({ ...p, [id]: { ...p[id], uptie: v } }))}
                    />
                </div>
            </td>
            <td>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.1rem" }}>
                    {getComputedComponents(id)}
                </div>
            </td>
            <td>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.2rem" }}>
                    <button {...getGeneralTooltipProps("Reset to default")}
                        onClick={() => {
                            setStarts(p => ({ ...p, [id]: {} }));
                            setTargets(p => ({ ...p, [id]: {} }));
                        }}
                        disabled={Object.keys(starts[id]).length + Object.keys(targets[id]).length === 0}
                        style={{ ...buttonStyle, fontSize: "1.25rem" }}
                    >
                        ↺
                    </button>
                    <button {...getGeneralTooltipProps("Remove from list")}
                        onClick={() => {
                            setSelected(p => p.filter(x => x !== id))
                            const { [id]: s, ...newStarts } = starts;
                            const { [id]: t, ...newTargets } = targets;
                            setStarts(newStarts);
                            setTargets(newTargets);
                        }}
                        style={{ ...buttonStyle, color: uiColors.red, fontSize: "1.5rem" }} //#ff4848
                    >
                        x
                    </button>
                </div>
            </td>
        </tr>
    }

    const filterFunc = id => {
        if (searchString.trim().length === 0) return true;
        if (`${id}`[0] === "1")
            return checkFilterMatch(searchString, identities[id].name);
        else
            return checkFilterMatch(searchString, egos[id].name);
    }

    return <div style={{ height: "min(90vh, 1250px)", overflowY: "auto", overflowX: "auto", maxWidth: "95vw", border: "1px #aaa solid", borderRadius: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center", paddingLeft: "0.5rem" }}>
            Search:
            <input value={searchString} onChange={e => setSearchString(e.target.value)} />
        </div>
        <table style={{ borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    <th style={stickyHeaderStyle}>Identity/E.G.O</th>
                    <th style={stickyHeaderStyle}>Current</th>
                    <th style={stickyHeaderStyle}>Target</th>
                    <th style={stickyHeaderStyle}>Cost</th>
                    <th style={stickyHeaderStyle}></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={{width: "128px", textAlign: "center"}}>Default<br />Setting</td>
                    <td style={{width: "128px"}}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.1rem" }}>
                            <NumberInputWithButtons
                                min={1} max={LEVEL_CAP} value={starts.default.level}
                                setValue={v => setStarts(p => ({ ...p, default: { ...p.default, level: v } }))}
                                inputStyle={{width: "2ch"}}
                            />
                            <UptieSelector
                                value={starts.default.uptie}
                                setValue={v => setStarts(p => ({ ...p, default: { ...p.default, uptie: v } }))}
                                bottomOption={"unowned"}
                                bottomDisplay={<span></span>}
                            />
                        </div>
                    </td>
                    <td style={{width: "128px"}}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.1rem" }}>
                            <NumberInputWithButtons
                                min={1} max={LEVEL_CAP} value={targets.default.level}
                                setValue={v => setTargets(p => ({ ...p, default: { ...p.default, level: v } }))}
                                inputStyle={{width: "2ch"}}
                            />
                            <UptieSelector
                                value={targets.default.uptie}
                                setValue={v => setTargets(p => ({ ...p, default: { ...p.default, uptie: v } }))}
                            />
                        </div>
                    </td>
                    <td  style={{width: "128px"}}/>
                    <td />
                </tr>
                {selected.filter(filterFunc).map(id => constructRow(id))}
            </tbody>
        </table>
    </div>
}