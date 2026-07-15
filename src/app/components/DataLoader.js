"use client";

import { useData } from "./DataProvider";

export default function DataLoader({ file, type, id, children, fallback = null }) {
    const [data, loading] = useData(file);

    if (loading) return fallback;

    const item = data?.[id];
    if (!item) return <span>Unknown {type ?? file}: {id}</span>;

    return children(item);
}