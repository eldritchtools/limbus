"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { getSupabase } from './connection';
import { useAuth } from "./authProvider";

const RequestsCacheContext = createContext(null);

const makeKey = (type, id) => `${type}:${id}`;

export function RequestsCacheProvider({ children }) {
    const { user } = useAuth();
    const [likedMap, setLikedMap] = useState({});
    const [savedMap, setSavedMap] = useState({});

    const loadedKeys = useRef(new Set());
    const queuedKeys = useRef(new Set());
    const flushTimeout = useRef(null);

    const stateMap = {
        likes: [likedMap, setLikedMap],
        saves: [savedMap, setSavedMap]
    };

    const fetchInteraction = async (table, targetType, ids) => {
        if (!user || ids.length === 0) return;

        const { data, error } = await getSupabase()
            .from(table)
            .select("target_id")
            .eq("target_type", targetType)
            .in("target_id", ids)
            .eq("user_id", user.id);

        if (error) {
            console.error(`Error loading ${table}`, error);
            return;
        }

        const [, setMap] = stateMap[table];

        const result = new Set(data.map(r => r.target_id));
        const update = {};

        for (const id of ids) {
            const key = makeKey(targetType, id);
            update[key] = result.has(id);
        }

        setMap(prev => ({ ...prev, ...update }));
    };


    const fetchUserData = useCallback((targetType, targetIds) => {
        if (!user) return;

        const newKeys = targetIds
            .map(id => makeKey(targetType, id))
            .filter(key => !loadedKeys.current.has(key));

        if (!newKeys.length) return;

        newKeys.forEach(k => loadedKeys.current.add(k));
        newKeys.forEach(k => queuedKeys.current.add(k));

        if (!flushTimeout.current) {
            flushTimeout.current = setTimeout(async () => {
                const keys = Array.from(queuedKeys.current);
                queuedKeys.current.clear();
                flushTimeout.current = null;

                const grouped = {};

                for (const key of keys) {
                    const [type, id] = key.split(":");
                    if (!grouped[type]) grouped[type] = [];
                    grouped[type].push(id);
                }

                for (const type in grouped) {
                    const ids = grouped[type];

                    const init = {};
                    ids.forEach(id => {
                        const k = makeKey(type, id);
                        init[k] = null;
                    });

                    setLikedMap(prev => ({ ...prev, ...init }));
                    setSavedMap(prev => ({ ...prev, ...init }));

                    await Promise.all([
                        fetchInteraction("likes", type, ids),
                        fetchInteraction("saves", type, ids)
                    ]);
                }
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const toggleInteraction = async (table, targetType, targetId) => {
        if (!user) return;

        const key = makeKey(targetType, targetId);
        const [map, setMap] = stateMap[table];

        const current = map[key];

        if (current) {
            await getSupabase()
                .from(table)
                .delete()
                .eq("target_type", targetType)
                .eq("target_id", targetId);
        } else {
            await getSupabase()
                .from(table)
                .insert({ target_type: targetType, target_id: targetId });
        }

        setMap(prev => ({ ...prev, [key]: !current }));
    };

    const checkLiked = useCallback((targetType, targetId) => likedMap[makeKey(targetType, targetId)], [likedMap]);
    const checkSaved = useCallback((targetType, targetId) => savedMap[makeKey(targetType, targetId)], [savedMap]);

    return <RequestsCacheContext.Provider
        value={{
            checkLiked,
            checkSaved,
            fetchUserData,
            toggleLike: (type, id) => toggleInteraction("likes", type, id),
            toggleSave: (type, id) => toggleInteraction("saves", type, id)
        }}
    >
        {children}
    </RequestsCacheContext.Provider>;
}

export function useRequestsCache() {
    const ctx = useContext(RequestsCacheContext);
    if (!ctx) throw new Error("useRequestsCache must be used within provider");
    return ctx;
}
