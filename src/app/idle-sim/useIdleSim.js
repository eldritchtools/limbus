import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { assignAgentPoints, renameAgent } from "./agents";
import { AUTOSAVE_INTERVAL, TICK_CHECK_INTERVAL } from "./constants";
import { chooseEventOption, dismissEvent } from "./events";
import { claimExpedition, startExpedition } from "./expeditions";
import { assignAgent, assignSubject, buildNewDepartment, renameDepartment, setCycleLength, setScheduleBlock, unassignAgent, unassignSubject } from "./facility";
import { buyGear, equipGear, unequipGear } from "./gear";
import { chooseCandidate, rerollCandidates, startHiring } from "./hiring";
import { claimQuest } from "./quests";
import { summarizeReports } from "./reports";
import { loadDBGame, loadLocalGame, resetDBGame, resetLocalGame, saveDBGame, saveLocalGame } from "./save";
import { getSetting, setSetting } from "./settings";
import { simulateTick, simulateUntil } from "./simulation";
import { createInitialState, getCurrentLocalTick, getClockOffset } from "./util";
import { useData } from "../components/DataProvider";
import { useAuth } from "../database/authProvider";

export default function useIdleSim() {
    const [rawData, rawDataLoading] = useData("idle_sim/idle_sim");
    const [data, dataLoading] = useMemo(() => {
        if (rawDataLoading) return [null, true];
        const data = { ...rawData };

        const defaultSubject = { max_agents: 1, reward_mult: 1, max_level: 5, effects: [] };
        data.subjects = Object.fromEntries(Object.entries(data.subjects).map(([id, subject]) => [id, { ...defaultSubject, id, ...subject }]));

        const defaultGear = { max_copies: 5, unlocks: [] };
        data.weapons = Object.fromEntries(Object.entries(data.weapons).map(([id, weapon]) => [id, { ...defaultGear, ...weapon }]));
        data.armor = Object.fromEntries(Object.entries(data.armor).map(([id, armor]) => [id, { ...defaultGear, ...armor }]));
        data.gifts = Object.fromEntries(Object.entries(data.gifts).map(([id, gift]) => [id, { ...defaultGear, ...gift }]));

        const defaultQuest = { requires: [] };
        data.quests = Object.fromEntries(Object.entries(data.quests).map(([id, quest]) => [id, { ...defaultQuest, ...quest }]));

        return [data, false];
    }, [rawData, rawDataLoading]);
    const { user, loading: authLoading } = useAuth();

    const [state, setState] = useState(null);
    const [uiState, setUiState] = useState({ intro: true, tab: "reports" });
    const [revision, setRevision] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [error, setError] = useState(null);

    const [catchupSummary, setCatchupSummary] = useState(null);

    const stateRef = useRef(null);
    const dirtyRef = useRef(false);
    const savingRef = useRef(false);
    const revisionRef = useRef(null);
    const clockOffsetRef = useRef(0);

    const userId = user?.id ?? null;
    const loadedForRef = useRef(undefined);

    const updateState = useCallback((nextState, markDirty = true) => {
        if (!nextState) { console.warn("Action rejected"); return; }
        stateRef.current = nextState;
        if (markDirty) dirtyRef.current = true;
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
            setLastSaved(new Date());

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
            const initialState = { ...createInitialState(result.serverTick), ...result.state };

            const startTick = initialState.game_tick;
            const nextState = simulateUntil(data, initialState, result.serverTick);
            const ticksSimulated = nextState.game_tick - startTick;

            if (ticksSimulated > 0 && result.state) {
                const summary = summarizeReports(nextState.reports, startTick, nextState.game_tick - 1);
                setCatchupSummary(summary);
            } else {
                setCatchupSummary(null);
            }

            updateState(nextState, false);
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

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (dirtyRef.current) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);

    useEffect(() => {
        return () => {
            if (dirtyRef.current && stateRef.current) {
                saveGame();
            }
        };
    }, [saveGame]);

    const forceTick = useCallback(async () => {
        if (process.env.NODE_ENV !== "development") return;
        const currentState = stateRef.current;
        if (!currentState || !loaded) return;

        const nextState = simulateTick(data, currentState);
        updateState(nextState);
        await saveGame();
    }, [loaded, data, updateState, saveGame]);

    useEffect(() => {
        if (authLoading || dataLoading) return;
        if (loadedForRef.current === userId) return;
        loadedForRef.current = userId;
        loadGame();
    }, [authLoading, dataLoading, userId, loadGame]);

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

    const updateUiState = update => setUiState(p => ({ ...p, ...update }));

    const functions = useMemo(() => {
        return {
            getSetting: setting => getSetting(state, setting),
            setSetting: (setting, value) => { updateState(setSetting(stateRef.current, setting, value)) },
            renameAgent: (agentId, name) => { updateState(renameAgent(stateRef.current, agentId, name)) },
            renameDepartment: (departmentIndex, name) => { updateState(renameDepartment(stateRef.current, departmentIndex, name)) },
            startHiring: level => { updateState(startHiring(stateRef.current, level)); saveGame(); },
            rerollCandidates: () => { updateState(rerollCandidates(stateRef.current)) },
            chooseCandidate: index => { updateState(chooseCandidate(stateRef.current, index)) },
            assignAgentPoints: (agentId, points) => { updateState(assignAgentPoints(stateRef.current, agentId, points)) },
            assignAgent: (agentId, departmentIndex, agentIndex) => { updateState(assignAgent(stateRef.current, agentId, departmentIndex, agentIndex)) },
            unassignAgent: agentId => { updateState(unassignAgent(stateRef.current, agentId)) },
            assignSubject: (subjectId, departmentIndex, subjectIndex) => { updateState(assignSubject(data, stateRef.current, subjectId, departmentIndex, subjectIndex)) },
            unassignSubject: subjectId => { updateState(unassignSubject(stateRef.current, subjectId)) },
            setCycleLength: (departmentIndex, cycleLength) => { updateState(setCycleLength(stateRef.current, departmentIndex, cycleLength)) },
            setScheduleBlock: (departmentIndex, agentId, block, subjectId) => { updateState(setScheduleBlock(data, stateRef.current, departmentIndex, agentId, block, subjectId)) },
            startExpedition: (expeditionId, agentIds) => { updateState(startExpedition(data, stateRef.current, expeditionId, agentIds)); },
            claimExpedition: id => { updateState(claimExpedition(data, stateRef.current, id)); },
            chooseEventOption: (id, optionIndex) => { updateState(chooseEventOption(data, stateRef.current, id, optionIndex)); },
            dismissEvent: id => { updateState(dismissEvent(stateRef.current, id)); },
            buyGear: (type, id) => { updateState(buyGear(data, stateRef.current, type, id)); },
            equipGear: (agentId, type, id) => { updateState(equipGear(data, stateRef.current, agentId, type, id)); },
            unequipGear: (agentId, type, id) => { updateState(unequipGear(data, stateRef.current, agentId, type, id)); },
            claimQuest: questId => { updateState(claimQuest(data, stateRef.current, questId)); }
        }
    }, [data, state, updateState, saveGame]);

    return {
        catchupSummary, uiState, setUiState, updateUiState,
        state, data, loaded, saving, error, lastSaved,
        updateState, loadGame, saveGame, resetGame, forceTick,
        ...functions
    };
}