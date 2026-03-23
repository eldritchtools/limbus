import { useEffect } from "react";

import Icon from "../icons/Icon";
import DropdownButton from "../objects/DropdownButton";
import NumberInput from "../objects/NumberInput";

import { LEVEL_CAP } from "@/app/lib/constants";

export default function BuildDisplayCalcMenu({ opts, setOpts }) {
    useEffect(() => {
        setOpts({ source: "identity", cond: "default", type: "max", sp: 0, crit: "poise", view: "compress", target: {} });
    }, [setOpts]);

    const valueComponent = (name, key, def) => <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
        <Icon path={name} style={{ width: "32px", height: "32px" }} />
        <NumberInput
            value={opts.target ? (opts.target[key] ?? def) : def}
            onChange={v => setOpts(p => ({ ...p, target: { ...p.target, [key]: v } }))}
            style={{ width: "5ch", textAlign: "center" }}
        />
    </div>

    const resetTarget = () => {
        setOpts(p => ({ ...p, target: {} }));
    }

    const resetButton = <button onClick={resetTarget}>Default</button>

    let staggerLevel = 0;
    if ("target" in opts) {
        if ((opts.target.slash ?? 1) === 2 && (opts.target.pierce ?? 1) === 2 && (opts.target.blunt ?? 1) === 2) staggerLevel = 1;
        else if ((opts.target.slash ?? 1) === 2.5 && (opts.target.pierce ?? 1) === 2.5 && (opts.target.blunt ?? 1) === 2.5) staggerLevel = 2;
        else if ((opts.target.slash ?? 1) === 3 && (opts.target.pierce ?? 1) === 3 && (opts.target.blunt ?? 1) === 3) staggerLevel = 3;
    }

    const applyStagger = r => {
        setOpts(p => ({ ...p, target: { ...p.target, slash: r, pierce: r, blunt: r } }));
    }

    const staggerButton = staggerLevel === 1 ?
        <button onClick={() => applyStagger(2.5)}>Stagger+</button> :
        staggerLevel === 2 ?
            <button onClick={() => applyStagger(3)}>Stagger++</button> :
            <button onClick={() => applyStagger(2)}>Stagger</button>

    const applyLunarMemory = () => {
        setOpts(p => ({ ...p, target: { ...p.target, slash: 2, pierce: 2, blunt: 2, wrath: 2, lust: 2, sloth: 2, gluttony: 2, gloom: 2, pride: 2, envy: 2 } }));
    }

    const lunarMemoryButton = <button onClick={applyLunarMemory}>Lunar Memory</button>

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingBottom: "0.25rem" }}>
        <span style={{ textAlign: "center" }}>These computations only count the skill in isolation and do not consider most other effects such as statuses on the sinner/target, passives, resonance bonuses, and so on.<br />Any numbers shown are only meant to serve as a guide and may not be 100% accurate. Numbers with underlines have additional info that can be displayed with a tooltip. Errors can be reported in the Discord.</span>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", border: "1px #777 solid", borderRadius: "0.5rem", padding: "0.25rem" }}>
                <span style={{ fontSize: "1.2rem" }}>Skill Info:</span>
                <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "repeat(2, auto)" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        Skills:
                        <DropdownButton
                            value={opts.source ?? "identity"}
                            setValue={(x) => setOpts(p => ({ ...p, source: x }))}
                            options={{ "identity": "Identity Skills", "ego": "E.G.O Skills" }}
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        View Mode:
                        <DropdownButton
                            value={opts.view ?? "expand"}
                            setValue={(x) => setOpts(p => ({ ...p, view: x }))}
                            options={{ "compress": "Compressed", "expand": "Expanded" }}
                        />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            Coin Rolls:
                            <DropdownButton
                                value={opts.type ?? "max"}
                                setValue={(x) => setOpts(p => ({ ...p, type: x }))}
                                options={{ "max": "Max Rolls", "avg": "Average", "min": "Min Rolls" }}
                            />
                        </div>
                        {opts.type === "avg" ?
                            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                                <span>SP:</span>
                                <input type="number" min={-45} max={45} value={opts.sp === 0 ? "" : (opts.sp ?? 0)}
                                    onChange={e => setOpts(p => ({ ...p, sp: e.target.value === "" ? 0 : Math.min(45, Math.max(-45, Number(e.target.value))) }))}
                                    style={{ width: "3ch", textAlign: "center" }}
                                />
                            </div> :
                            null}
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        Apply Crits:
                        <DropdownButton
                            value={opts.crit ?? "poise"}
                            setValue={(x) => setOpts(p => ({ ...p, crit: x }))}
                            options={{ "all": "All Skills", "poise": "Poise Ids/Skills", "none": "Ignore Crits" }}
                        />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gridColumn: "span 2", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            Conditionals:
                            <DropdownButton
                                value={opts.cond ?? "default"}
                                setValue={(x) => setOpts(p => ({ ...p, cond: x }))}
                                options={{ "default": "Default Values", "skill": "With Skill Effects", "all": "With Skill/Coin Effects" }}
                            />
                        </div>
                        {<span style={{ whiteSpace: "pre-wrap", textAlign: "center" }}>
                            {opts.cond === "default" ?
                                "Default base and coin power" :
                                opts.cond === "skill" ?
                                    "Power and damage conditionals on the skill" :
                                    "Power and damage conditionals on the skill and its coins"
                            }
                        </span>}
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", border: "1px #777 solid", borderRadius: "0.5rem", padding: "0.25rem" }}>
                <span style={{ fontSize: "1.2rem" }}>Target Levels and Resists:</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
                    {valueComponent("offense level", "off", LEVEL_CAP)}
                    {valueComponent("defense level", "def", LEVEL_CAP)}
                    {valueComponent("Slash", "slash", 1)}
                    {valueComponent("Pierce", "pierce", 1)}
                    {valueComponent("Blunt", "blunt", 1)}
                    {valueComponent("wrath", "wrath", 1)}
                    {valueComponent("lust", "lust", 1)}
                    {valueComponent("sloth", "sloth", 1)}
                    {valueComponent("gluttony", "gluttony", 1)}
                    {valueComponent("gloom", "gloom", 1)}
                    {valueComponent("pride", "pride", 1)}
                    {valueComponent("envy", "envy", 1)}
                    <div style={{ textAlign: "center", gridColumn: "span 3", padding: "0.2rem" }}>Apply Values:</div>
                    {resetButton}
                    {staggerButton}
                    {lunarMemoryButton}
                </div>
            </div>
        </div>
    </div>
}