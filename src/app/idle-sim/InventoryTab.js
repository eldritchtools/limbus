import React, { useMemo, useState } from "react";

import { StatTable } from "./components";
import { checkExpeditionUnlocked } from "./expeditions";
import { getEquippedCopies, getGearCost, getPurchaseLimit } from "./gear";
import { GiftSprite } from "./icons";
import styles from "./idleSim.module.css";
import { getIdleSimTooltipProps } from "./idleSimTooltip";
import { AgentMenuSelector } from "./selectors";
import { isAgentOnExpedition, toCurrencyStr } from "./util";
import DropdownButton from "../components/objects/DropdownButton";
import { uiColors } from "../lib/colors";

function Item({ idleSim, tab }) {
    const itemId = idleSim.uiState.item;
    const itemData = idleSim.data[tab][itemId];
    const itemState = idleSim.state.inventory[tab][itemId] ?? 0;
    const limit = Math.max(itemState, getPurchaseLimit(idleSim.data, idleSim.state, tab, itemId));
    const unlocked = itemState > 0 || limit > 0;
    const cost = itemData.price ? getGearCost(idleSim.data, idleSim.state, tab, itemId) : null;
    const purchaseable = itemState < limit && cost <= idleSim.state.currency;

    const equippedCopies = getEquippedCopies(idleSim.state, tab, itemId);
    const unequippedCount = Math.max(0, itemState - equippedCopies);

    const equippedAgents = Object.values(idleSim.state.agents).filter(agent => {
        if (tab === "weapons") return agent.weapon === itemId;
        if (tab === "armor") return agent.armor === itemId;
        if (tab === "gifts") return agent.gifts.includes(itemId);
        return false;
    });

    const eligibleAgents = Object.values(idleSim.state.agents).filter(agent => {
        if (isAgentOnExpedition(idleSim.state, agent.id)) return false;
        if (tab === "weapons") return agent.weapon !== itemId;
        if (tab === "armor") return agent.armor !== itemId;
        if (tab === "gifts") return !agent.gifts.includes(itemId) && agent.gifts.length < 5;
        return false;
    });

    const dropExpeditions = useMemo(() => {
        const exps = new Set();
        for (const [expId, exp] of Object.entries(idleSim.data.expeditions ?? {})) {
            if (exp.reward?.drops?.some(d => d.id === itemId && d.type === tab)) {
                exps.add(expId);
                continue;
            }
            for (const ev of (exp.events ?? [])) {
                const evData = idleSim.data.events[ev.id];
                if (evData.options.some(o => (o.effects ?? []).some(e => e.type === "drop" && e.drop_type === tab && e.id === itemId))) {
                    exps.add(expId);
                    break;
                }
            }
        }
        return [...exps];
    }, [idleSim.data, itemId, tab]);

    return <>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            <div className={styles.tile} style={{ position: "relative", flex: 1, minWidth: "320px", maxWidth: "380px", gap: "0.6rem" }}>
                <button
                    style={{ position: "absolute", border: "none", background: "transparent", color: uiColors.red, cursor: "pointer", padding: "0 2px", top: "3px", right: "3px" }}
                    onClick={() => idleSim.updateUiState({ item: null })}
                >
                    ✕
                </button>

                {tab === "gifts" &&
                    <GiftSprite width={100} height={100} src={itemData.src} style={{ filter: itemState ? "" : "brightness(0)" }} />
                }
                <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>{unlocked ? itemData.name : "???"}</span>
                {unlocked ? <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem", width: "100%", textAlign: "center" }}>
                        <div className={styles.tile} style={{ padding: "0.3rem" }}>
                            <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Owned</span>
                            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{itemState}</span>
                        </div>
                        <div className={styles.tile} style={{ padding: "0.3rem" }}>
                            <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Equipped</span>
                            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{equippedCopies}</span>
                        </div>
                        <div className={styles.tile} style={{ padding: "0.3rem" }}>
                            <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Available</span>
                            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                                {unequippedCount}
                            </span>
                        </div>
                    </div>

                    <div className={styles.tile} style={{ width: "100%", padding: "0.5rem", gap: "0.3rem", alignItems: "center" }}>
                        {itemData.price ? <>
                            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: "0.85rem" }}>
                                <span>Purchase Limit: <strong>{itemState} / {limit}</strong></span>
                                <span>Price: <strong>{toCurrencyStr(cost)}</strong></span>
                            </div>
                            <button
                                disabled={!purchaseable}
                                onClick={() => idleSim.buyGear(tab, itemId)}
                                style={{ width: "100%", padding: "0.4rem", fontWeight: "bold", cursor: purchaseable ? "pointer" : "not-allowed" }}
                            >
                                {itemState >= limit ? "Purchase Limit Reached" : `Buy Copy (${toCurrencyStr(cost)})`}
                            </button>
                        </> :
                            <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>Drop item only (not sold in shop).</span>
                        }
                    </div>

                    <span style={{ textAlign: "center" }}>
                        {itemData.desc}
                    </span>
                    {(itemData.statuses ?? []).map(st => {
                        const status = idleSim.data.statuses[st];
                        <span key={st} style={{ fontSize: "0.85rem" }}>{status.name}: {status.desc}</span>
                    })}
                </> :
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.5rem" }}>
                        <span style={{ fontWeight: "bold", textAlign: "center" }}>How to Unlock</span>

                        {itemData.unlocks && itemData.unlocks.length > 0 ?
                            <div style={{ fontSize: "0.85rem" }}>
                                <span style={{ opacity: 0.8 }}>Research Unlocks:</span>
                                <ul style={{ margin: "0.2rem 0 0 1rem", padding: 0 }}>
                                    {itemData.unlocks.map((unlock, i) => {
                                        const sub = idleSim.data.subjects[unlock.subject];
                                        const subUnlocked = unlock.subject in idleSim.state.subjects;
                                        const nameComp = subUnlocked ?
                                            <span
                                                style={{ cursor: "pointer", textDecoration: "underline" }}
                                                onClick={() => idleSim.updateUiState({ tab: "subjects", subject: unlock.subject })}
                                            >
                                                {sub.name}
                                            </span> :
                                            <span style={{ fontWeight: "bold" }}>???</span>;

                                        return <li key={i}>
                                            Research {nameComp} to Lv. {unlock.level} (+{unlock.copies} {unlock.copies === 1 ? "copy" : "copies"})
                                        </li>
                                    })}
                                </ul>
                            </div> :
                            null
                        }

                        {dropExpeditions.length > 0 ?
                            <div style={{ fontSize: "0.85rem" }}>
                                <span style={{ opacity: 0.8 }}>Expedition Drop:</span>
                                <ul style={{ margin: "0.2rem 0 0 1rem", padding: 0 }}>
                                    {dropExpeditions.map(expId => {
                                        const unlocked = checkExpeditionUnlocked(idleSim.data, idleSim.state, expId);
                                        const nameComp = unlocked ?
                                            <span
                                                style={{ cursor: "pointer", textDecoration: "underline" }}
                                                onClick={() => idleSim.updateUiState({ tab: "expedition", dispatching: true, dispatchingId: expId })}
                                            >
                                                {idleSim.data.expeditions[expId].name}
                                            </span> :
                                            <span style={{ fontWeight: "bold" }}>???</span>;

                                        return <li key={expId}>
                                            {nameComp}
                                        </li>
                                    })}
                                </ul>
                            </div> :
                            null
                        }
                    </div>
                }
            </div>

            {unlocked &&
                <div className={styles.tile} style={{ flex: 1, minWidth: "320px", gap: "0.75rem", alignItems: "stretch" }}>
                    {tab !== "gifts" && <>
                        <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>Stats</span>
                        <StatTable data={itemData} />
                    </>}

                    <span style={{ fontWeight: "bold", fontSize: "1rem" }}>Assigned Agents ({equippedCopies})</span>
                    {equippedAgents.length > 0 ?
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                            {equippedAgents.map(ag => (
                                <div key={ag.id} className={styles.tile} style={{ flexDirection: "row", padding: "0.2rem 0.5rem", gap: "0.4rem", alignItems: "center" }}>
                                    <span>{ag.name}</span>
                                    <button
                                        style={{ border: "none", color: uiColors.red, cursor: "pointer", padding: "0 2px" }}
                                        onClick={() => idleSim.unequipGear(ag.id, tab, itemId)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div> :
                        <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>No agents currently equipping this.</span>
                    }

                    {unequippedCount > 0 && eligibleAgents.length > 0 && (
                        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginTop: "0.3rem" }}>
                            <span style={{ fontSize: "0.85rem" }}>Equip to:</span>
                            <AgentMenuSelector
                                value={null}
                                setValue={x => idleSim.equipGear(x, tab, itemId)}
                                options={eligibleAgents}
                                styleOverride={{ border: "none", fontWeight: "bold", width: "auto" }}
                                textOnly={true}
                            />
                        </div>
                    )}

                    {itemData.unlocks.length > 0 && <>
                        <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>Unlock Sources</span>
                        <div style={{ display: "grid", gridTemplateColumns: "24px 30px 1fr 30px", gap: "0.3rem", fontSize: "0.9rem", marginTop: "0.2rem", justifyItems: "center" }}>
                            <div />
                            <span>Lv</span>
                            <span>Subject</span>
                            <span>Num</span>
                            {itemData.unlocks.map((unlock, i) => {
                                const subjectData = idleSim.data.subjects[unlock.subject];
                                const subjectState = idleSim.state.subjects[unlock.subject];
                                return <React.Fragment key={i}>
                                    <div>{subjectState?.research_level >= unlock.level ? "✔" : ""}</div>
                                    <span>{unlock.level}</span>
                                    <span>{subjectState ?
                                        <span
                                            style={{ cursor: "pointer", textDecoration: "underline" }}
                                            onClick={() => idleSim.updateUiState({ tab: "subjects", subject: unlock.subject })}
                                        >
                                            {subjectData.name}
                                        </span> :
                                        "???"}
                                    </span>
                                    <span>x{unlock.copies}</span>
                                </React.Fragment>
                            })}
                        </div>
                    </>}

                    {dropExpeditions.length > 0 && <>
                        <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>Expedition Sources</span>
                        <ul style={{ margin: "0.2rem 0 0 1rem", padding: 0 }}>
                            {dropExpeditions.map(expId => {
                                const unlocked = checkExpeditionUnlocked(idleSim.data, idleSim.state, expId);
                                const nameComp = unlocked ?
                                    <span
                                        style={{ cursor: "pointer", textDecoration: "underline" }}
                                        onClick={() => idleSim.updateUiState({ tab: "expedition", dispatching: true, dispatchingId: expId })}
                                    >
                                        {idleSim.data.expeditions[expId].name}
                                    </span> :
                                    <span style={{ fontWeight: "bold" }}>???</span>;

                                return <li key={expId}>
                                    {nameComp}
                                </li>
                            })}
                        </ul>
                    </>}
                </div>
            }
        </div>
    </>
}

function ItemsGrid({ idleSim, tab, items }) {
    return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem", width: "100%" }}>
        {items.map(id => {
            const item = idleSim.data[tab][id];
            const copies = idleSim.state.inventory[tab][id] ?? 0;
            const limit = getPurchaseLimit(idleSim.data, idleSim.state, tab, id);
            const unlocked = id in idleSim.state.inventory[tab] || limit > 0;

            return <div key={id}
                className={styles.clickableTile}
                style={{ position: "relative" }}
                onClick={() => idleSim.updateUiState({ item: id })}
                {...(unlocked ? getIdleSimTooltipProps(tab, id) : {})}
            >
                {copies < limit &&
                    <div style={{ position: "absolute", width: "10px", height: "10px", background: uiColors.green, top: "5px", right: "5px", borderRadius: "50%", zIndex: 5 }} />
                }
                {tab === "gifts" &&
                    <GiftSprite width={100} height={100} src={item.src} style={{ filter: unlocked ? "" : "brightness(0)" }} />
                }
                <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>{unlocked ? item.name : "???"}</span>
            </div>
        })}
    </div>
}

export default function InventoryTab({ idleSim }) {
    const setTab = tab => idleSim.updateUiState({ invTab: tab, item: null });

    const [filter, setFilter] = useState("all");

    const [tab, items] = useMemo(() => {
        const tab = idleSim.uiState.invTab ?? "weapons";

        if (filter === "owned")
            return [tab, Object.keys(idleSim.state.inventory[tab])];

        if (filter === "unowned")
            return [tab, Object.keys(idleSim.data[tab]).filter(id => !(id in idleSim.state.inventory[tab]))];

        if (filter === "all")
            return [tab, Object.keys(idleSim.data[tab])];
    }, [idleSim.data, idleSim.state, idleSim.uiState, filter]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%", marginTop: "-1rem" }}>
        <div style={{ display: "flex", marginBottom: ".5rem", gap: "1rem" }}>
            <div className={`tab-header ${tab === "weapons" ? "active" : ""}`} onClick={() => setTab("weapons")}>Weapons</div>
            <div className={`tab-header ${tab === "armor" ? "active" : ""}`} onClick={() => setTab("armor")}>Armor</div>
            <div className={`tab-header ${tab === "gifts" ? "active" : ""}`} onClick={() => setTab("gifts")}>Gifts</div>
        </div>

        {idleSim.uiState.item ?
            <Item idleSim={idleSim} tab={tab} /> :
            <>
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    Filter:
                    <DropdownButton value={filter} setValue={setFilter}
                        options={{ owned: "Owned", unowned: "Unowned", all: "All" }}
                    />
                </div>
                <ItemsGrid idleSim={idleSim} tab={tab} items={items} />
            </>
        }
    </div>;
}