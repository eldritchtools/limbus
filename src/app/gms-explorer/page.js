"use client";

import { useState } from "react";

import ItemsView from "./ItemsView";
import MapView from "./MapView";
import NoPrefetchLink from "../components/NoPrefetchLink";

export default function GMSExplorerPage() {
    const [tab, setTab] = useState("map");

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Grand Magasin Sisyphe Explorer</h1>
        <p style={{ margin: 0 }}>
            Explore an interactive map and other details of the Grand Magasin Sisyphe.
        </p>
        <p className="sub-text" style={{ margin: 0, textAlign: "center", maxWidth: "1280px" }}>
            Explore the different maps of the Grand Magasin Sisyphe and find items obtainable on each floor. Select a Route and Floor to view the map for that floor.
            <br /> <br />
            Each map has interactive markers showing locations such as shops, enemies, interactions, and quests, with details about the items available at each location. Below the map is a list of items obtainable on the floor. Clicking on an item will highlight the corresponding marker for its location. The <b>Items</b> tab provides a complete list of items across all routes and floors.
            <br /> <br />
            All credit goes to the <NoPrefetchLink className="text-link" href={"https://limbuscompany.wiki.gg/"}>Limbus Company Wiki</NoPrefetchLink> for the map images. Each map will also show a link to its corresponding wiki page.
            <br /> <br />
            This is a work in progress. Some floors may still be incomplete or may not have maps available. Conditions for some items, particularly hidden ones, are taken from the wiki and have not yet been personally confirmed. Any corrections or suggestions can be submitted through the <NoPrefetchLink className="text-link" href={"/feedback"}>Feedback</NoPrefetchLink> page.
        </p>

        <div style={{ display: "flex", marginBottom: "1rem", gap: "1rem" }}>
            <div className={`tab-header ${tab === "map" && "active"}`} onClick={() => setTab("map")}>Map</div>
            <div className={`tab-header ${tab === "items" && "active"}`} onClick={() => setTab("items")}>Items</div>
        </div>

        {tab === "map" && <MapView />}
        {tab === "items" && <ItemsView />}
    </div>
}
