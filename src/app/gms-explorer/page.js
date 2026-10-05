"use client";

import { useRouter, useSearchParams } from "next/navigation";

import ItemsView from "./ItemsView";
import MapView from "./MapView";
import NoPrefetchLink from "../components/NoPrefetchLink";

export default function GMSExplorerPage() {
    const router = useRouter();

    const searchParams = useSearchParams().entries().reduce((acc, [f, v]) => {
        if (f === "tab") acc["tab"] = v;
        if (f === "subtab") acc["subtab"] = v;
        if (f === "route") acc["route"] = v;
        if (f === "floor") acc["floor"] = v;
        if (f === "marker") acc["marker"] = v;
        return acc;
    }, { tab: "map", subtab: "items" });

    const handleSetTab = tab => {
        const params = new URLSearchParams();
        params.set("tab", tab);
        router.replace(`/gms-explorer?${params.toString()}`, { scroll: false });
    }

    const handleSetSubtab = subtab => {
        const params = new URLSearchParams(searchParams);
        params.set("subtab", subtab);
        params.delete("marker");
        router.replace(`/gms-explorer?${params.toString()}`, { scroll: false });
    }

    const handleSetRoute = route => {
        if (searchParams.tab !== "map") return;
        const params = new URLSearchParams();
        params.set("tab", searchParams.tab);
        params.delete("marker");
        if (route) params.set("route", route);

        router.replace(`/gms-explorer?${params.toString()}`, { scroll: false });
    };

    const handleSetFloor = floor => {
        if (searchParams.tab !== "map" || !searchParams.route) return;
        const params = new URLSearchParams(searchParams);
        params.set("tab", searchParams.tab);
        params.set("route", searchParams.route);
        params.delete("marker");
        if (floor) params.set("floor", floor);

        router.replace(`/gms-explorer?${params.toString()}`, { scroll: false });
    };

    const handleSetMarker = marker => {
        if (searchParams.tab !== "map" || !searchParams.route || !searchParams.floor) return;
        const params = new URLSearchParams(searchParams);
        params.set("tab", searchParams.tab);
        params.set("route", searchParams.route);
        params.set("floor", searchParams.floor);
        params.set("marker", marker);

        router.replace(`/gms-explorer?${params.toString()}`, { scroll: false });
    };

    const handleGoToMarker = (route, floor, marker) => {
        const params = new URLSearchParams();
        params.set("tab", "map");
        params.set("subtab", "items");
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
            Explore the different maps of the Grand Magasin Sisyphe and find items obtainable on each floor. The <b>Map</b> tab lets you select a Route and Floor to view the map for that floor, while the <b>Items</b> tab provides a complete list of items across all routes and floors.
            <br /> <br />
            Each map has interactive markers showing locations with details about each location. Select the tab of the markers you want below the map to view the relevant items. Clicking on a marker or item will highlight the corresponding marker for its location and show any additional details.
            <br /> <br />
            All credit goes to the <NoPrefetchLink className="text-link" href={"https://limbuscompany.wiki.gg/"}>Limbus Company Wiki</NoPrefetchLink> for the map images. Each map will also show a link to its corresponding wiki page. Some floors are currently using incomplete maps or are missing maps entirely. They will be updated once their corresponding maps are available.
            <br /> <br />
            Any corrections or suggestions can be submitted through the <NoPrefetchLink className="text-link" href={"/feedback"}>Feedback</NoPrefetchLink> page.
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
                subtab={searchParams.subtab} handleSetSubtab={handleSetSubtab}
            />
        }
        {searchParams.tab === "items" && <ItemsView handleGoToMarker={handleGoToMarker} />}
    </div>
}
