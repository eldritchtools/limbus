"use client";

/* eslint-disable */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { clientFetchData } from "./DataFetcher";

const DataContext = createContext();

export function DataProvider({ children }) {
    const [dataStore, setDataStore] = useState({});
    const inFlight = useRef({});

    const getData = useCallback(async (path) => {
        if (path in dataStore) return dataStore[path];
        if (inFlight.current[path]) return inFlight.current[path];

        const promise = (async () => {
            const data = await clientFetchData(path);

            setDataStore(prev => ({ ...prev, [path]: data }));
            delete inFlight.current[path];

            return data;
        })();

        inFlight.current[path] = promise;
        return promise;
    }, []);

    const value = useMemo(() => ({ dataStore, getData }), [dataStore, getData]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function useData(path, enabled = true) {
    const { dataStore, getData } = useContext(DataContext);
    const [data, setData] = useState(path in dataStore ? dataStore[path] : null);
    const [loading, setLoading] = useState(!data);

    useEffect(() => {
        if (!path || !enabled) return;

        const cached = dataStore[path];
        if (cached) {
            setData(cached);
            setLoading(false);
            return;
        }

        setData(null);
        setLoading(true);

        let cancelled = false;

        getData(path)
            .then(fetched => {
                if (!cancelled) setData(fetched);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true };
    }, [path, enabled, dataStore, getData]);

    return [data, loading];
}

function useStableSet(arr) {
    const ref = useRef(new Set(arr));
    const prev = ref.current;
    const next = new Set(arr);

    const changed =
        prev.size !== next.size ||
        [...next].some(x => !prev.has(x));

    if (changed) {
        ref.current = next;
    }

    return ref.current; // stable Set reference
}

export function useDataMultiple(paths = [], enabled = true) {
    const stableSet = useStableSet(paths);
    const { dataStore, getData } = useContext(DataContext);

    const [dataMap, setDataMap] = useState({});
    const requestedRef = useRef(new Set());

    useEffect(() => {
        setDataMap(() => {
            const next = {};
            stableSet.forEach(p => {
                next[p] = dataStore[p] ?? null;
            });
            return next;
        });
    }, [stableSet, dataStore]);

    useEffect(() => {
        if (!enabled) return;

        stableSet.forEach(path => {
            if (!requestedRef.current.has(path)) {
                requestedRef.current.add(path);
                if (dataStore[path] == null) {
                    getData(path);
                }
            }
        });
    }, [stableSet, enabled, getData]);

    const loading = enabled && [...stableSet].some(p => dataMap[p] == null);

    return [dataMap, loading];
}
