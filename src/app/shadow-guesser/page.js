"use client";

import { useEffect, useMemo, useState } from "react";

import FinishedScreen from "./FinishedScreen";
import { useShadowGuesserGenerator } from "./generator";
import GuessingScreen from "./GuessingScreen";
import RevealScreen from "./RevealScreen";
import SetupScreen from "./SetupScreen";
import { categories, checkAnswer, defaultSettings } from "./util";
import NitroAd from "../components/ads/NitroAd";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { useGuesser } from "../components/quiz/useGuesser";
import { getLocalStore } from "../database/localDB";

const GUESSER_ID = "shadow";

function SetupWrapper({ settings, setSettings, guesser }) {
    const handleSetSettings = async (valueOrFn) => {
        const newSettings = typeof valueOrFn === "function" ? valueOrFn(settings) : valueOrFn;
        await getLocalStore("guessers").save({ id: GUESSER_ID, ...newSettings });
        setSettings(newSettings);
    }

    return <SetupScreen
        settings={settings}
        setSettings={handleSetSettings}
        onStart={() => guesser.start(settings)}
        onReset={() => handleSetSettings(defaultSettings)}
    />
}

function Guesser({ settings, guesser }) {
    const [generator, data, loading] = useShadowGuesserGenerator(settings);

    useEffect(() => {
        if (guesser.phase !== "loading" || loading) return;
        guesser.registerGenerator(generator);
        guesser.registerChecker(checkAnswer);
        guesser.next();
    }, [guesser, generator, loading]);

    const options = useMemo(() => {
        if (loading) return [];
        const options = [];
        Object.entries(data).forEach(([cat, dat]) => {
            Object.entries(dat).forEach(([id, item]) => {
                const option = { category: cat, answer: id };
                if (cat === "gifts") {
                    option.label = `[${categories[cat].label}] ${item.names[0]}`;
                    option.searchStrings = [item.names[0]];
                } else {
                    option.label = `[${categories[cat].label}] ${item.name}`;
                    option.searchStrings = [item.name];
                }
                options.push(option);
            })
        })
        return options;
    }, [data, loading]);

    if (loading || guesser.phase === "loading")
        return <LoadingContentPageTemplate />

    if (guesser.phase === "guessing")
        return <GuessingScreen settings={settings} guesser={guesser} data={data} options={options} submitAnswer={guesser.submitGuess} skip={guesser.skip} />

    if (guesser.phase === "reveal")
        return <RevealScreen settings={settings} guesser={guesser} data={data} next={guesser.next} />

    if (guesser.phase === "finished")
        return <FinishedScreen settings={settings} guesser={guesser} data={data} />
}

export default function ShadowGuesserPage() {
    const guesser = useGuesser(GUESSER_ID);
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        const loadSettings = async () => {
            const saved = await getLocalStore("guessers").get(GUESSER_ID);
            if (saved) setSettings(saved);
            else setSettings(defaultSettings);
        }

        loadSettings();
    }, []);

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <NitroAd id={"minigame-top-ad"} height={90} adLevel={"min"} style={{ width: "100%" }} />

        {guesser.phase === "setup" ?
            <SetupWrapper settings={settings} setSettings={setSettings} guesser={guesser} /> :
            <Guesser settings={settings} guesser={guesser} />
        }
    </div>;
}