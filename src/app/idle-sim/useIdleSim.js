import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { loadDBGame, loadLocalGame, resetDBGame, resetLocalGame, saveDBGame, saveLocalGame } from "./save";
import { simulateTick, simulateUntil } from "./simulation";
import { createInitialState, AUTOSAVE_INTERVAL, TICK_CHECK_INTERVAL, getCurrentLocalTick, getClockOffset } from "./util";
import { useData } from "../components/DataProvider";
import { useAuth } from "../database/authProvider";

export default function useIdleSim() {
    const [rawData, rawDataLoading] = useData("idle_sim/idle_sim");
    const [data, dataLoading] = useMemo(() => {
        if(rawDataLoading) return [null, true];
        const data = {...rawData};

        const defaultSubject = { max_agents: 1, reward_mult: 1, max_level: 5 };
        data.subjects = Object.fromEntries(Object.entries(data.subjects).map(([id, subject]) => [id, {...defaultSubject, ...subject}]))

        return [data, false];
    }, [rawData, rawDataLoading]);
    const { user, loading: authLoading } = useAuth();

    const [state, setState] = useState(null);
    const [revision, setRevision] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const stateRef = useRef(null);
    const dirtyRef = useRef(false);
    const savingRef = useRef(false);
    const revisionRef = useRef(null);
    const clockOffsetRef = useRef(0);

    const updateState = useCallback((nextState) => {
        stateRef.current = nextState;
        dirtyRef.current = true;
        setState(nextState);
    }, []);

    const saveGame = useCallback(async () => {
        const stateToSave = stateRef.current;
        if (!stateToSave || savingRef.current) return;

        savingRef.current = true;
        setSaving(true);
        setError(null);

        try {
            const result = user
                ? await saveDBGame(stateToSave, revisionRef.current)
                : await saveLocalGame(stateToSave, revisionRef.current);

            revisionRef.current = result.revision;
            clockOffsetRef.current = getClockOffset(result.serverTime);
            setRevision(result.revision);

            if (stateRef.current === stateToSave) {
                dirtyRef.current = false;
            }
        } catch (err) {
            console.error("Failed to save idle game:", err);
            setError("Failed to save game.");
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    }, [user]);

    const loadGame = useCallback(async () => {
        setLoaded(false);
        setError(null);

        try {
            const result = user ? await loadDBGame() : await loadLocalGame();
            clockOffsetRef.current = getClockOffset(result.serverTime);
            const initialState = result.state ?? createInitialState(result.serverTick);
            const nextState = simulateUntil(data, initialState, result.serverTick);

            updateState(nextState);
            revisionRef.current = result.revision;
            setRevision(result.revision);
            setLoaded(true);

            if (nextState.game_tick !== initialState.game_tick || !result.state) {
                await saveGame();
            }
        } catch (err) {
            console.error("Failed to load idle game:", err);
            setError("Failed to load game.");
        }
    }, [user, data, updateState, saveGame]);

    const resetGame = useCallback(async () => {
        if (!window.confirm("Are you sure you want to reset your game? All progress will be lost.")) return;

        try {
            if (user) await resetDBGame();
            else await resetLocalGame();

            revisionRef.current = null;
            await loadGame();
        } catch (err) {
            console.error("Failed to reset idle game:", err);
            setError("Failed to reset game.");
        }
    }, [user, loadGame]);

    const forceTick = useCallback(async () => {
        if(process.env.NODE_ENV !== "development") return;
        const currentState = stateRef.current;
        if (!currentState || !loaded) return;

        const nextState = simulateTick(data, currentState);
        updateState(nextState);
        await saveGame();
    }, [loaded, data, updateState, saveGame]);

    useEffect(() => {
        if (authLoading || dataLoading) return;
        loadGame();
    }, [authLoading, dataLoading, loadGame]);

    useEffect(() => {
        if (!loaded) return;

        const interval = setInterval(() => {
            const currentState = stateRef.current;
            if (!currentState) return;

            const targetTick = getCurrentLocalTick(clockOffsetRef.current);
            if (targetTick <= currentState.latest_simulated_tick) return;

            updateState(simulateUntil(data, currentState, targetTick));

            saveGame();
        }, TICK_CHECK_INTERVAL);

        return () => clearInterval(interval);
    }, [loaded, data, updateState, saveGame]);

    useEffect(() => {
        if (!loaded) return;

        const interval = setInterval(() => {
            if (dirtyRef.current) {
                saveGame();
            }
        }, AUTOSAVE_INTERVAL);

        return () => clearInterval(interval);
    }, [loaded, saveGame]);

    return {
        state, data, loaded, saving, error,
        updateState, loadGame, saveGame, resetGame, forceTick
    };
}