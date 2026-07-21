"use client";

import { useEffect, useRef, useState } from "react";

import DraftScreen from "./DraftScreen";
import { generateChoices } from "./generator";
import SetupScreen from "./SetupScreen";
import { useDraft } from "./useDraft";
import { useData } from "../components/DataProvider";
import { useWbState } from "../components/objects/WbList";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { getLocalStore } from "../database/localDB";
import { triggerToolUsedGAEvent } from "../lib/gaEvents";

export const defaultSettings = {
    rounds: 12,
    choices: 3,
    countdownTime: 3,
    choiceTime: 5,
    autoAdvance: true,
    randomizationRule: "standard",
    emptyEgoProb: 0
}

export default function TeamDraftPage() {
    const [identitiesData, identitiesLoading] = useData("identities_mini");
    const [egosData, egosLoading] = useData("egos_mini");

    const [wbOpen, setWbOpen] = useState(false);
    const wbState = useWbState();

    const [settings, setSettings] = useState(defaultSettings);

    const [seed, setSeed] = useState();

    const draft = useDraft(settings, (identities, egos, blocked, addBlocked) =>
        generateChoices(settings, wbState, identitiesData, egosData, identities, egos, blocked, addBlocked)
    );

    const [initializing, setInitializing] = useState(true);
    const saveTimeout = useRef(null);

    useEffect(() => {
        if (!initializing) return;
        const handleData = data => {
            setInitializing(false);
            if (!data) return;
            if (data.wbOpen) setWbOpen(data.wbOpen);
            if (data.wbState) wbState.updateState(data.wbState);
            if (data.settings) setSettings(data.settings);
        }

        getLocalStore("teamDraft").get("main").then(handleData);
    }, [initializing, wbState]);

    useEffect(() => {
        if (initializing) return;

        const saveData = async () => {
            const data = { id: "main", wbOpen, wbState: wbState.getSavedState(), settings }
            await getLocalStore("teamDraft").save(data);
        };

        clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(async () => {
            try {
                await saveData();
            } catch (err) {
                console.error("Unable to persist data.");
            }
        }, 100);

        return () => clearTimeout(saveTimeout.current);
    }, [initializing, wbOpen, wbState, settings]);

    const beginDraft = () => {
        triggerToolUsedGAEvent("Team Draft");
        draft.startDraft();
    }

    const loading = identitiesLoading || egosLoading || initializing

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        {draft.phase === "setup" ?
            <SetupScreen
                settings={settings}
                setSettings={setSettings}
                wbState={wbState}
                wbOpen={wbOpen}
                setWbOpen={setWbOpen}
                onStart={beginDraft}
                loading={loading}
            /> :
            <DraftScreen
                settings={settings}
                draft={draft}
            />
        }

    </div>;
}

