"use client";

import * as Select from "@radix-ui/react-select";
import { useMemo, useRef, useState } from "react";

import { DEFAULT_AGENT_SPRITE } from "./constants";
import { AgentSprite, EnemySprite, GiftSprite } from "./icons";
import { getIdleSimTooltipProps } from "./idleSimTooltip";
import styles from "./selectors.module.css";
import { useData } from "../components/DataProvider";
import Icon from "../components/icons/Icon";
import { uiColors } from "../lib/colors";
import { checkFilterMatch } from "../lib/filter";

function Selector({ value, setValue, options, optionFilter, buildOption, defaultDisplay, rowItems = 5, optionWidth = 100, triggerClass, menuNotes, styleOverride = {} }) {
    const [filter, setFilter] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);

    const filtered = useMemo(() => {
        if (!filter) return options;
        return options.filter(opt => optionFilter(filter, opt));
    }, [filter, options, optionFilter]);

    const handleOpenChange = (open) => {
        setIsOpen(open);
        setFilter("");
    }

    return <Select.Root value={value ? value.id : null} onValueChange={v => setValue(v)} open={isOpen} onOpenChange={handleOpenChange}>
        <Select.Trigger className={`${styles.selectorTrigger} ${triggerClass}`} ref={triggerRef} style={styleOverride} >
            {value ? buildOption(value, true) : defaultDisplay}
        </Select.Trigger>

        <Select.Portal>
            <Select.Content className={styles.selectorContent} position="popper">
                {menuNotes}

                {optionFilter &&
                    <div style={{ paddingBottom: "0.2rem" }}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                }

                <Select.Viewport>
                    <div className={styles.selectorGrid} style={{ gridTemplateColumns: `repeat(${rowItems}, auto)` }}>
                        {filtered.map(option => <Select.Item key={option.id} value={option.id} className={styles.selectorItem} style={{ height: "100%" }}>
                            {buildOption(option)}
                        </Select.Item>)}
                        {value ? <Select.Item key={"cancel"} value={null} className={styles.selectorItem} style={{ height: "100%" }}>
                            <div className={styles.selectorItemInner}
                                style={{
                                    width: `${optionWidth}px`, height: "100%", justifyContent: "center",
                                    color: uiColors.red, fontWeight: "bold"
                                }}
                            >
                                ✕
                            </div>
                        </Select.Item> : null}
                    </div>
                    {filtered.length > 12 ? <div className={styles.selectorFadeBottom} > ▼ </div> : null}
                </Select.Viewport>
            </Select.Content>
        </Select.Portal>
    </Select.Root>;
}

export function AgentMenuSelector({ state, value, setValue, options, textOnly = false, styleOverride = {} }) {
    const optionFilter = (filter, opt) => checkFilterMatch(filter, opt.name);
    const showGroups = options.some(x => x.group);

    const buildOption = (option, triggerItem = false) => {
        if (textOnly) {
            return <div className={styles.selectorItemInner}
                style={{ width: triggerItem ? "auto" : "200px", wordBreak: "break-word", height: "100%", justifyContent: "center" }}
                {...getIdleSimTooltipProps("agent", option.id)}
            >
                {!triggerItem && <AgentSprite agent={option} width={50} height={75} />}
                {option.name}
                {!triggerItem && showGroups && <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>{option.group ?? "Unassigned"}</span>}
            </div>
        }

        return <div className={styles.selectorItemInner}
            style={{ width: triggerItem ? "96px" : "200px", wordBreak: "break-word", height: "100%", justifyContent: "center" }}
            {...getIdleSimTooltipProps("agent", option.id)}
        >
            {option && <AgentSprite agent={option} width={50} height={75} />}
            {option.name}
            {!triggerItem && showGroups && <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>{option.group ?? "Unassigned"}</span>}
        </div>
    }

    const defaultOption = textOnly ?
        <div className={styles.selectorItemInner}>
            Unassigned
        </div> :
        <div className={styles.selectorItemInner} style={{ width: "96px", height: "96px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {"+ Agent"}
        </div>

    const optionsSorted = useMemo(() =>
        options.sort((a, b) => {
            const ga = a.group ?? "";
            const gb = b.group ?? "";
            if (ga === gb) {
                const order = state.agentsOrder ?? Object.keys(state.agents);
                return order.findIndex(x => x === String(a.id)) - order.findIndex(x => x === String(b.id));
            }
            return ga.localeCompare(gb);
        }),
        [state, options]
    )

    return <Selector value={value}
        setValue={v => setValue(v ? Number(v) : null)}
        options={optionsSorted} styleOverride={styleOverride}
        rowItems={2} optionWidth={200}
        optionFilter={optionFilter} buildOption={buildOption}
        defaultDisplay={defaultOption}
    />
}

export function SubjectMenuSelector({ value, setValue, options, textOnly = false, styleOverride = {} }) {
    const optionFilter = (filter, opt) => checkFilterMatch(filter, opt.name);

    const buildOption = (option, triggerItem = false) => {
        if (textOnly) {
            return <div className={styles.selectorItemInner} style={{ width: triggerItem ? undefined : "96px" }}
                {...(triggerItem ? {} : getIdleSimTooltipProps("subject", option.id))}
            >
                {!triggerItem && <EnemySprite width={96} height={96} src={option.src} />}
                {option ? option.name : "Unassigned"}
            </div>
        }

        return <div className={styles.selectorItemInner} style={{ width: triggerItem ? undefined : "96px" }}
            {...getIdleSimTooltipProps("subject", option.id)}
        >
            <EnemySprite width={96} height={96} src={option.src} />
            {!triggerItem && option.name}
        </div>
    }

    const defaultOption = textOnly ?
        <div className={styles.selectorItemInner}>
            Unassigned
        </div> :
        <div className={styles.selectorItemInner} style={{ width: "96px", height: "96px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {"+ Subject"}
        </div>

    return <Selector value={value} setValue={setValue} options={options} styleOverride={styleOverride}
        optionWidth={100}
        optionFilter={optionFilter} buildOption={buildOption}
        defaultDisplay={defaultOption}
    />
}

export function ScheduleMenuSelector({ value, setValue, options }) {
    const buildOption = (option, triggerItem = false) => {
        if (triggerItem) {
            return <div className={styles.selectorItemInner} style={{ display: "flex", flexDirection: "row", width: "150px", minHeight: "40px" }}>
                <EnemySprite key={option.id} width={32} height={32} src={option.src} />
                <span style={{ flex: 1 }}>{option.name}</span>
            </div>
        } else {
            return <div className={styles.selectorItemInner} style={{ width: "96px" }}>
                <EnemySprite key={option.id} width={96} height={96} src={option.src} />
                {option.name}
            </div>
        }
    }

    return <Selector value={options.find(x => x.id === value)} setValue={setValue} options={options}
        optionWidth={100} buildOption={buildOption}
        triggerClass={`${styles.scheduleTrigger} ${value ? styles.work : styles.break}`}
        defaultDisplay={
            <div className={styles.selectorItemInner} style={{ width: "150px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {"Break"}
            </div>
        }
    />
}

export function GearMenuSelector({ value, setValue, type, options, styleOverride = {} }) {
    const buildOption = (option, triggerItem = false) => {
        return <div key={option.id} className={styles.selectorItemInner}
            style={{
                flexDirection: "row", alignItems: "center", justifyContent: "center",
                border: "none", width: triggerItem ? "auto" : "200px"
            }}
            {...getIdleSimTooltipProps(type, option.id)}
        >
            {triggerItem && (
                type === "weapons" ? <Icon path={"offense level"} size={32} /> :
                    type === "armor" ? <Icon path={"defense level"} size={32} /> :
                        <GiftSprite width={64} height={64} src={value.src} />
            )}
            {(type !== "gifts" || !triggerItem) && <span>{option.name}</span>}
        </div>
    }

    const defaultOption =
        type === "weapons" ? <div style={{ display: "flex", alignItems: "center" }}>
            <Icon path={"offense level"} size={32} />
            <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>None</span>
        </div> :
            type === "armor" ? <div style={{ display: "flex", alignItems: "center" }}>
                <Icon path={"defense level"} size={32} />
                <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>None</span>
            </div> :
                <div>
                    <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>None</span>
                </div>

    return <Selector value={value} setValue={setValue} options={options}
        rowItems={2} optionWidth={200} buildOption={buildOption}
        defaultDisplay={defaultOption} styleOverride={styleOverride}
    />
}

export function AgentSpriteSelector({ idleSim, value, setValue }) {
    const [spriteUnlock, loading] = useData("idle_sim/sprite_unlocks");

    const options = useMemo(() => {
        if (loading) return [];
        const options = [];

        Object.entries(spriteUnlock.enemy).forEach(([exp, ids]) => {
            if (exp === "default" || idleSim.state.cleared_expeditions.includes(exp))
                ids.forEach(id => options.push({ id: `E-${id}` }))
        });

        return options;
    }, [idleSim.state.cleared_expeditions, spriteUnlock, loading]);

    const buildOption = (option, triggerItem) => {
        return <div style={{ width: "80px", height: "140px", padding: "0.2rem" }}>
            <AgentSprite agent={{ sprite: option.id ?? DEFAULT_AGENT_SPRITE }} />
        </div>
    }

    return <Selector value={{ id: value }} setValue={setValue} options={options}
        buildOption={buildOption} defaultDisplay={buildOption(DEFAULT_AGENT_SPRITE)}
        menuNotes={<span style={{ fontSize: "0.8rem", opacity: "0.7", textAlign: "center" }}>More sprites are unlocked through Expedition progress.</span>}
    />
}