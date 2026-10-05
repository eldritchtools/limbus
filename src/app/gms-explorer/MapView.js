import { useBreakpoint } from "@eldritchtools/shared-components";
import { useCallback, useMemo } from "react";
import Select from "react-select";

import DeathCard from "./DeathCard";
import DialogueCard from "./DialogueCard";
import ItemCard from "./ItemCard";
import MapViewer from "./MapViewer";
import MarkerPopover from "./MarkerPopover";
import { subtabDescs } from "./util";
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

function ContentWrapper({ route, floor, datafile, floorData, marker, handleSetMarker, subtab, handleSetSubtab }) {
    const [data, dataLoading] = useData(`rpg/${datafile}`);
    const [items, itemsLoading] = useData("rpg/items");
    const { isMobile } = useBreakpoint();

    const selectedMarker = useMemo(() =>
        dataLoading ? null : data[floor]?.markers.find(x => x.id === marker),
        [dataLoading, data, floor, marker]
    );

    const itemsDisplay = useMemo(() => {
        if (dataLoading) return [];
        const itemsList = [...(data[floor]?.markers ?? []).reduce((acc, marker) => {
            if (subtab === "items") {
                if (marker.type === "shop") {
                    marker.items?.forEach(x => acc.add(x.itemId));
                } else if (["drop", "interaction", "quest"].includes(marker.type)) {
                    marker.items?.forEach(x => acc.add(x));
                }
            } else if (subtab === "dialogues") {
                if (marker.type === "dialogue") acc.add(marker);
            } else if (subtab === "deaths") {
                if (marker.type === "death") acc.add(marker);
            }
            return acc;
        }, new Set())];

        return itemsList.map(idOrMarker => {
            if (selectedMarker) {
                if (subtab === "items") {
                    if (selectedMarker.type === "shop") {
                        return [selectedMarker.items?.some(x => x.itemId === idOrMarker), idOrMarker];
                    } else if (["drop", "interaction", "quest"].includes(selectedMarker.type)) {
                        return [selectedMarker.items?.some(x => x === idOrMarker), idOrMarker];
                    } else {
                        return [false, idOrMarker];
                    }
                } else if (subtab === "dialogues") {
                    if (selectedMarker.type === "dialogue")
                        return [selectedMarker.id === idOrMarker.id, idOrMarker];
                    else
                        return [false, idOrMarker];
                } else if (subtab === "deaths") {
                    if (selectedMarker.type === "death")
                        return [selectedMarker.id === idOrMarker.id, idOrMarker];
                    else
                        return [false, idOrMarker];
                } else {
                    return [true, idOrMarker];
                }
            } else {
                return [true, idOrMarker];
            }
        });
    }, [data, dataLoading, selectedMarker, floor, subtab]);

    const filteredMarkers = useMemo(() => {
        if (dataLoading) return [];
        if (subtab === "items") {
            return data[floor]?.markers.filter(x => ["shop", "drop", "interaction", "quest"].includes(x.type))
        } else if (subtab === "dialogues") {
            return data[floor]?.markers.filter(x => x.type === "dialogue")
        } else if (subtab === "deaths") {
            return data[floor]?.markers.filter(x => x.type === "death")
        }
    }, [subtab, data, dataLoading, floor])

    const findItem = useCallback(item => {
        const newMarker = data[floor].markers.find(x => {
            if (x.type === "shop") {
                return x.items.some(y => y.itemId === item)
            } else if (["drop", "interaction", "quest"].includes(x.type)) {
                return x.items?.some(y => y === item)
            } else {
                return false;
            }
        })

        if (newMarker && newMarker.id === marker) handleSetMarker(null);
        else if (newMarker) handleSetMarker(newMarker.id);
    }, [data, floor, marker, handleSetMarker]);

    if (dataLoading || itemsLoading) return;

    return <>
        {floorData.image ?
            <>
                <MapViewer
                    src={mapSource(floorData.image)}
                    alt={`${route} ${floor} map`}
                    width={floorData.width}
                    height={floorData.height}
                    markers={filteredMarkers}
                    selectedMarker={selectedMarker}
                    setSelectedMarker={newMarker => handleSetMarker(newMarker?.id ?? null)}
                />
                <span>Map Credit: <NoPrefetchLink className="text-link" href={floorData.source}>{floorData.source}</NoPrefetchLink></span>
            </> :
            <>
                Map Currently Unavailable
                {selectedMarker && <MarkerPopover marker={selectedMarker} inDiv={true} onClose={() => handleSetMarker(null)} />}
            </>
        }

        <div style={{ display: "flex", marginBottom: "1rem", gap: "1rem" }}>
            <div className={`tab-header ${subtab === "items" && "active"}`} onClick={() => handleSetSubtab("items")}>Items</div>
            <div className={`tab-header ${subtab === "dialogues" && "active"}`} onClick={() => handleSetSubtab("dialogues")}>Dialogues</div>
            <div className={`tab-header ${subtab === "deaths" && "active"}`} onClick={() => handleSetSubtab("deaths")}>Deaths</div>
        </div>

        <span className="sub-text">{subtabDescs[subtab]}</span>

        {subtab === "items" &&
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 200 : 400}px, 1fr))`, width: "100%", gap: "0.2rem" }}>
                {itemsDisplay.map(([on, id]) => {
                    const item = items[id];
                    return <ItemCard key={id} id={id} item={item} greyed={!on} clickable={() => findItem(id)} />;
                })}
            </div>
        }

        {subtab === "dialogues" && <>
            {selectedMarker && <DialogueCard id={selectedMarker.id} dialogue={selectedMarker} expanded={true} />}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 200 : 400}px, 1fr))`, width: "100%", gap: "0.2rem" }}>
                {itemsDisplay.map(([on, dialogue]) => {
                    return <DialogueCard key={dialogue.id} id={dialogue.id} dialogue={dialogue} greyed={!on} clickable={() => handleSetMarker(dialogue.id)} />;
                })}
            </div>
        </>
        }

        {subtab === "deaths" &&
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 200 : 400}px, 1fr))`, width: "100%", gap: "0.2rem" }}>
                {itemsDisplay.map(([on, death]) => {
                    return <DeathCard key={death.id} id={death.id} death={death} greyed={!on} clickable={() => handleSetMarker(death.id)} />;
                })}
            </div>
        }
    </>
}

export default function MapView({
    route, handleSetRoute,
    floor, handleSetFloor,
    marker, handleSetMarker,
    subtab, handleSetSubtab
}) {
    const [floors, floorsLoading] = useData("rpg/floors");
    const { isMobile } = useBreakpoint();

    const routeOptions = useMemo(() => {
        if (floorsLoading) return [];
        return Object.entries(floors).map(([id, data]) => ({ value: id, label: data.name }))
    }, [floors, floorsLoading]);

    const floorOptions = useMemo(() => {
        if (floorsLoading || !route) return [];
        return Object.entries(floors[route].floors).map(([id, data]) => ({ value: id, label: data.name }))
    }, [floors, floorsLoading, route]);

    if (floorsLoading) return <LoadingContentPageTemplate />;

    const routeData = route ? floors[route] : null;
    const floorData = routeData && floor ? routeData.floors[floor] : null;

    return <>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: `auto ${isMobile ? 200 : 300}px`, alignItems: "center", justifyContent: "center", gap: "0.5rem", textAlign: "center" }}>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Route</span>
                <Select
                    options={routeOptions}
                    value={route ? routeOptions.find(x => x.value === route) : null}
                    onChange={x => handleSetRoute(x.value)}
                    placeholder={"Choose Route..."}
                    filterOption={(candidate, input) => checkFilterMatch(input, candidate.label)}
                    styles={selectStyle}
                />
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Floor</span>
                <Select
                    options={floorOptions}
                    value={floor ? floorOptions.find(x => x.value === floor) : null}
                    onChange={x => handleSetFloor(x.value)}
                    placeholder={"Choose Floor..."}
                    filterOption={(candidate, input) => checkFilterMatch(input, candidate.label)}
                    styles={selectStyle}
                />
            </div>
        </div>
        <HorizontalDivider />
        {floorData && <ContentWrapper
            route={route} floor={floor} datafile={routeData.datafile} floorData={floorData}
            marker={marker} handleSetMarker={handleSetMarker} subtab={subtab} handleSetSubtab={handleSetSubtab}
        />}
    </>

}