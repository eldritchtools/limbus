"use client";

import * as Select from "@radix-ui/react-select";
import { useMemo, useRef, useState } from "react";

import { EnemySprite, GiftSprite } from "./icons";
import { getIdleSimTooltipProps } from "./idleSimTooltip";
import styles from "./selectors.module.css";
import Icon from "../components/icons/Icon";
import { uiColors } from "../lib/colors";
import { checkFilterMatch } from "../lib/filter";

function Selector({ value, setValue, options, optionFilter, buildOption, defaultDisplay, rowItems = 5, optionWidth = 100, triggerClass, styleOverride = {} }) {
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

export function AgentMenuSelector({ value, setValue, options, textOnly = false, styleOverride = {} }) {
    const optionFilter = (filter, opt) => checkFilterMatch(filter, opt.name);

    const buildOption = (option, triggerItem = false) => {
        if (textOnly) {
            return <div className={styles.selectorItemInner}
                style={{ width: triggerItem ? "auto" : "200px", wordBreak: "break-word", height: "100%", justifyContent: "center" }}
                {...getIdleSimTooltipProps("agent", option.id)}
            >
                {option.name}
            </div>
        }

        return <div className={styles.selectorItemInner}
            style={{ width: triggerItem ? "96px" : "200px", wordBreak: "break-word", height: "100%", justifyContent: "center" }}
            {...getIdleSimTooltipProps("agent", option.id)}
        >
            {option.name}
        </div>
    }

    const defaultOption = textOnly ?
        <div className={styles.selectorItemInner}>
            Unassigned
        </div> :
        <div className={styles.selectorItemInner} style={{ width: "96px", height: "96px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {"+ Agent"}
        </div>

    return <Selector value={value}
        setValue={v => setValue(v ? Number(v) : null)}
        options={options} styleOverride={styleOverride}
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
