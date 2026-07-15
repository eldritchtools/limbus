"use client";

import { useData } from "./DataProvider";

function UpcomingDataLoader({ type, id, children, fallback }) {
    const [data, loading] = useData("upcoming");

    if (loading) return fallback;

    const item = data?.[type]?.[id];
    if (!item) return <span>Unknown {type ?? file}: {id}</span>;

    return children(item);
}

export default function DataLoader({ file, type, id, children, fallback = null, upcomingFallback }) {
    const [data, loading] = useData(file);

    if (loading) return fallback;

    const item = data?.[id];
    if (!item) {
        if(upcomingFallback) {
            return <UpcomingDataLoader type={upcomingFallback} id={id} fallback={fallback}>
                {children}
            </UpcomingDataLoader>
        }
        return <span>Unknown {type ?? file}: {id}</span>;
    }

    return children(item);
}