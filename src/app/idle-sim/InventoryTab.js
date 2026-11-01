import { useMemo, useState } from "react";

import { StatTable } from "./components";
import { getPurchaseLimit } from "./gear";
import { GiftSprite } from "./icons";
import styles from "./idleSim.module.css";
import DropdownButton from "../components/objects/DropdownButton";

function Item({ idleSim, tab }) {
    const itemId = idleSim.uiState.item;
    const itemData = idleSim.data[tab][itemId];
    const itemState = idleSim.state.inventory[tab][itemId];

    return <>
        <button onClick={() => idleSim.updateUiState({ item: null })}>Go Back</button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {tab === "gifts" &&
                    <GiftSprite width={100} height={100} src={itemData.src} style={{ filter: itemState ? "" : "brightness(0)" }} />
                }
                <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>{itemState ? itemData.name : "???"}</span>
                {itemState &&
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 100px)", gap: "0.5rem", alignItems: "center", justifyItems: "center" }}>
                        <span>Copies:</span>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
                            <span>{itemState}</span>
                            <div style={{ width: "100%", border: "1px var(--primary-border-color) solid" }} />
                            <span>{Math.max(itemState, getPurchaseLimit(idleSim.data, idleSim.state, tab, itemId))}</span>
                        </div>
                    </div>
                }
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {itemState ?
                    <>
                        <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>Stats</span>
                        {tab !== "gifts" && <StatTable data={itemData} />}
                        <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>Unlocks</span>
                        <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "0.2rem" }}>

                        </div>
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
            const owned = id in idleSim.state.inventory[tab];
            return <div key={id} className={styles.clickableTile} onClick={() => idleSim.updateUiState({ item: id })}>
                {tab === "gifts" &&
                    <GiftSprite width={100} height={100} src={item.src} style={{ filter: owned ? "" : "brightness(0)" }} />
                }
                <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>{owned ? item.name : "???"}</span>
            </div>
        })}
    </div>
}

export default function InventoryTab({ idleSim }) {
    const setTab = tab => idleSim.updateUiState({ invTab: tab, item: null });

    const [filter, setFilter] = useState("owned");

    const [tab, items] = useMemo(() => {
        const tab = idleSim.uiState.invTab ?? "weapons";

        if (filter === "owned")
            return [tab, Object.keys(idleSim.state.inventory[tab])];

        if (filter === "unowned")
            return [tab, Object.keys(idleSim.data[tab]).filter(id => !(id in idleSim.state.inventory[tab]))];

        if (filter === "all")
            return [tab, Object.keys(idleSim.data[tab])];
    }, [idleSim.data, idleSim.state, idleSim.uiState, filter]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%", marginTop: "-1rem"    }}>
        <div style={{ display: "flex", marginBottom: ".5rem", gap: "1rem" }}>
            <div className={`tab-header ${tab === "weapons" && "active"}`} onClick={() => setTab("weapons")}>Weapons</div>
            <div className={`tab-header ${tab === "armor" && "active"}`} onClick={() => setTab("armor")}>Armor</div>
            <div className={`tab-header ${tab === "gifts" && "active"}`} onClick={() => setTab("gifts")}>Gifts</div>
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