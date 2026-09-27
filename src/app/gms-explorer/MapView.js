import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";

import ItemCard from "./ItemCard";
import MapViewer from "./MapViewer";
import MarkerPopover from "./MarkerPopover";
import { useData } from "../components/DataProvider";
import NoPrefetchLink from "../components/NoPrefetchLink";
import { HorizontalDivider } from "../components/objects/Dividers";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { checkFilterMatch } from "../lib/filter";
import { ASSETS_ROOT } from "../paths";
import { selectStyle } from "../styles/selectStyle";


function mapSource(path) {
    return `${ASSETS_ROOT}/rpg/maps/${path}.webp`;
}

function ContentWrapper({ route, floor, datafile, floorData }) {
    const [data, dataLoading] = useData(`rpg/${datafile}`);
    const [items, itemsLoading] = useData("rpg/items");
    const [selectedMarker, setSelectedMarker] = useState(null);
    const { isMobile } = useBreakpoint();

    const itemsDisplay = useMemo(() => {
        if (dataLoading) return [];
        const itemsList = [...(data[floor]?.markers ?? []).reduce((acc, marker) => {
            if (marker.type === "shop") {
                marker.items.forEach(x => acc.add(x.itemId));
            } else {
                marker.items.forEach(x => acc.add(x));
            }
            return acc;
        }, new Set())];

        return itemsList.map((id) => {
            if (selectedMarker) {
                if (selectedMarker.type === "shop") {
                    return [selectedMarker.items.some(x => x.itemId === id), id];
                } else {
                    return [selectedMarker.items.some(x => x === id), id];
                }
            } else {
                return [true, id];
            }
        }).sort((a, b) => Number(b[0]) - Number(a[0]));
    }, [data, dataLoading, selectedMarker, floor]);

    const findItem = useCallback(item => {
        const marker = data[floor].markers.find(x => {
            if (x.type === "shop") {
                return x.items.some(y => y.itemId === item)
            } else {
                return x.items.some(y => y === item)
            }
        })

        if (selectedMarker && marker.id === selectedMarker.id) setSelectedMarker(null);
        else if (marker) setSelectedMarker(marker);
    }, [data, floor, selectedMarker]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedMarker(null);
    }, [route, floor])

    if (dataLoading || itemsLoading) return;

    return <>
        {floorData.image ?
            <>
                <MapViewer
                    src={mapSource(floorData.image)}
                    alt={`${route} ${floor} map`}
                    width={floorData.width}
                    height={floorData.height}
                    markers={data[floor]?.markers ?? []}
                    selectedMarker={selectedMarker}
                    setSelectedMarker={setSelectedMarker}
                />
                <span>Map Credit: <NoPrefetchLink className="text-link" href={floorData.source}>{floorData.source}</NoPrefetchLink></span>
            </> :
            <>
                Map Currently Unavailable
                {selectedMarker && <MarkerPopover marker={selectedMarker} inDiv={true} onClose={() => setSelectedMarker(null)} />}
            </>
        }

        <div className="title-text">Items</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 200 : 400}px, 1fr))`, width: "100%", gap: "0.2rem" }}>
            {itemsDisplay.map(([on, id]) => {
                const item = items[id];
                return <ItemCard key={id} id={id} item={item} greyed={!on} clickable={() => findItem(id)} />;
            })}
        </div>
    </>
}

export default function MapView() {
    const [floors, floorsLoading] = useData("rpg/floors");
    const [route, setRoute] = useState(null);
    const [floor, setFloor] = useState(null);
    const { isMobile } = useBreakpoint();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFloor(null);
    }, [route]);

    const routeOptions = useMemo(() => {
        if (floorsLoading) return [];
        return Object.entries(floors).map(([id, data]) => ({ value: id, label: data.name }))
    }, [floors, floorsLoading]);

    const floorOptions = useMemo(() => {
        if (floorsLoading || !route) return [];
        return Object.entries(floors[route.value].floors).map(([id, data]) => ({ value: id, label: data.name }))
    }, [floors, floorsLoading, route]);

    if (floorsLoading) return <LoadingContentPageTemplate />;

    const routeData = route ? floors[route.value] : null;
    const floorData = routeData && floor ? routeData.floors[floor.value] : null;

    return <>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: `auto ${isMobile ? 200 : 300}px`, alignItems: "center", justifyContent: "center", gap: "0.5rem", textAlign: "center" }}>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Route</span>
                <Select
                    options={routeOptions}
                    value={route}
                    onChange={x => setRoute(x)}
                    placeholder={"Choose Route..."}
                    filterOption={(candidate, input) => checkFilterMatch(input, candidate.label)}
                    styles={selectStyle}
                />
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Floor</span>
                <Select
                    options={floorOptions}
                    value={floor}
                    onChange={x => setFloor(x)}
                    placeholder={"Choose Floor..."}
                    filterOption={(candidate, input) => checkFilterMatch(input, candidate.label)}
                    styles={selectStyle}
                />
            </div>
        </div>
        <HorizontalDivider />
        {floorData && <ContentWrapper
            route={route.value} floor={floor.value} datafile={routeData.datafile} floorData={floorData}
        />}
    </>

}