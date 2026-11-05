import React, { useMemo, useState } from "react";

import { StatTable } from "./components";
import { getGearCost, getOwnedCopies, getPurchaseLimit } from "./gear";
import { GiftSprite } from "./icons";
import styles from "./idleSim.module.css";
import { getIdleSimTooltipProps } from "./idleSimTooltip";
import { toCurrencyStr } from "./util";
import DropdownButton from "../components/objects/DropdownButton";

function Item({ idleSim, tab }) {
    const itemId = idleSim.uiState.item;
    const itemData = idleSim.data[tab][itemId];
    const itemState = idleSim.state.inventory[tab][itemId] ?? 0;
    const limit = Math.max(itemState, getPurchaseLimit(idleSim.data, idleSim.state, tab, itemId));
    const unlocked = itemState > 0 || limit > 0;
    const cost = itemData.price ? getGearCost(idleSim.data, idleSim.state, tab, itemId) : null;
    const purchaseable = itemState < limit && cost <= idleSim.state.currency;

    return <>
        <button onClick={() => idleSim.updateUiState({ item: null })}>Go Back</button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", maxWidth: "400px" }}>
                {tab === "gifts" &&
                    <GiftSprite width={100} height={100} src={itemData.src} style={{ filter: itemState ? "" : "brightness(0)" }} />
                }
                <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>{unlocked ? itemData.name : "???"}</span>
                {unlocked && <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem", alignItems: "center", justifyItems: "center" }}>
                        <span>Copies:</span>
                        <span />

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
                            <span>{itemState}</span>
                            <div style={{ width: "100%", border: "1px var(--primary-border-color) solid" }} />
                            <span>{limit}</span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
                            {itemData.price ? <>
                                <span>Cost: {toCurrencyStr(cost)}</span>
                                <button disabled={!purchaseable} onClick={() => idleSim.buyGear(tab, itemId)}>
                                    Purchase
                                </button>
                            </> : <>
                                <span>Not available for purchase</span>
                            </>}
                        </div>
                    </div>
                    {itemData.desc}
                </>}

            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {unlocked ?
                    <>
                        {tab !== "gifts" && <>
                            <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>Stats</span>
                            <StatTable data={itemData} />
                        </>}
                        {itemData.unlocks.length > 0 && <>
                            <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>Unlocks</span>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: "0.2rem", textAlign: "center", alignItems: "center", justifyItems: "center" }}>
                                <div />
                                <span>Lv</span>
                                <span>Subject</span>
                                <span>#</span>
                                {itemData.unlocks.map((unlock, i) => {
                                    const subjectData = idleSim.data.subjects[unlock.subject];
                                    const subjectState = idleSim.state.subjects[unlock.subject];
                                    return <React.Fragment key={i}>
                                        <div>{subjectState?.research_level >= unlock.level ? "✔" : ""}</div>
                                        <span>{unlock.level}</span>
                                        <span>{subjectState ? subjectData.name : "???"}</span>
                                        <span>x{unlock.copies}</span>
                                    </React.Fragment>
                                })}
                            </div>
                        </>}
                    </> :
                    <>
                        <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>How to Obtain</span>
                    </>
                }
            </div>
        </div>
    </>
}

function ItemsGrid({ idleSim, tab, items }) {
    return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem", width: "100%" }}>
        {items.map(id => {
            const item = idleSim.data[tab][id];
            const unlocked = id in idleSim.state.inventory[tab] || getPurchaseLimit(idleSim.data, idleSim.state, tab, id) > 0;
            return <div key={id}
                className={unlocked ? styles.clickableTile : styles.tile}
                onClick={unlocked ? () => idleSim.updateUiState({ item: id }) : null}
                {...(unlocked ? getIdleSimTooltipProps(tab, id) : {})}
            >
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