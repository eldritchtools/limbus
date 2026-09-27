"use client";

import { useRouter, useSearchParams } from "next/navigation";

import ItemsView from "./ItemsView";
import MapView from "./MapView";
import NoPrefetchLink from "../components/NoPrefetchLink";

export default function GMSExplorerPage() {
    const router = useRouter();

    const searchParams = useSearchParams().entries().reduce((acc, [f, v]) => {
        if (f === "tab") acc["tab"] = v;
        if (f === "route") acc["route"] = v;
        if (f === "floor") acc["floor"] = v;
        if (f === "marker") acc["marker"] = v;
        return acc;
    }, { tab: "map" });

    const handleSetTab = tab => {
        const params = new URLSearchParams();
        params.set("tab", tab);
        router.replace(`/gms-explorer?${params.toString()}`, { scroll: false });
    }

    const handleSetRoute = route => {
        if (searchParams.tab !== "map") return;
        const params = new URLSearchParams();
        params.set("tab", searchParams.tab);
        if (route) params.set("route", route);

        router.replace(`/gms-explorer?${params.toString()}`, { scroll: false });
    };

    const handleSetFloor = floor => {
        if (searchParams.tab !== "map" || !searchParams.route) return;
        const params = new URLSearchParams();
        params.set("tab", searchParams.tab);
        params.set("route", searchParams.route);
        if (floor) params.set("floor", floor);

        router.replace(`/gms-explorer?${params.toString()}`, { scroll: false });
    };

    const handleSetMarker = marker => {
        if (searchParams.tab !== "map" || !searchParams.route || !searchParams.floor) return;
        const params = new URLSearchParams();
        params.set("tab", searchParams.tab);
        params.set("route", searchParams.route);
        params.set("floor", searchParams.floor);
        if (marker) params.set("marker", marker);

        router.replace(`/gms-explorer?${params.toString()}`, { scroll: false });
    };

    const handleGoToMarker = (route, floor, marker) => {
        const params = new URLSearchParams();
        params.set("tab", "map");
        params.set("route", route);
        params.set("floor", floor);
        params.set("marker", marker);

        router.replace(`/gms-explorer?${params.toString()}`, { scroll: false });
        window.scrollTo(0, 0);
    };

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
            <div className={`tab-header ${searchParams.tab === "map" && "active"}`} onClick={() => handleSetTab("map")}>Map</div>
            <div className={`tab-header ${searchParams.tab === "items" && "active"}`} onClick={() => handleSetTab("items")}>Items</div>
        </div>

        {searchParams.tab === "map" &&
            <MapView
                route={searchParams.route} handleSetRoute={handleSetRoute}
                floor={searchParams.floor} handleSetFloor={handleSetFloor}
                marker={searchParams.marker} handleSetMarker={handleSetMarker}
            />
        }
        {searchParams.tab === "items" && <ItemsView handleGoToMarker={handleGoToMarker} />}
    </div>
}
