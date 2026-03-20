import { useMemo } from "react";
import { useData } from "../DataProvider";

function useFloorsPerPack() {
    const [floorPacks, floorPacksLoading] = useData("md_floor_packs");
    const floorsPerPack = useMemo(() => {
        const result = { normal: {}, hard: {} };
        if (floorPacksLoading) return result;

        Object.entries(floorPacks.normal).forEach(([floor, packs]) => packs.forEach(pack => {
            if (pack in result.normal) result.normal[pack].push(floor);
            else result.normal[pack] = [floor];
        }));
        Object.entries(floorPacks.hard).forEach(([floor, packs]) => packs.forEach(pack => {
            if (pack in result.hard) result.hard[pack].push(floor);
            else result.hard[pack] = [floor];
        }));
        return result;
    }, [floorPacks, floorPacksLoading]);

    return floorsPerPack;
}

function useFloorsForPack(packId) {
    const [floorPacks, floorPacksLoading] = useData("md_floor_packs");

    const floorsForPack = useMemo(() => {
        if (floorPacksLoading) return { normal: [], hard: [] };
        return {
            normal: Object.entries(floorPacks.normal).filter(([, packs]) => packs.includes(packId)).map(([floor]) => floor),
            hard: Object.entries(floorPacks.hard).filter(([, packs]) => packs.includes(packId)).map(([floor]) => floor)
        };
    }, [floorPacks, floorPacksLoading, packId]);

    return floorsForPack;
}

export { useFloorsPerPack, useFloorsForPack };