"use client";

import { useEffect, useRef, useState } from "react";

import FinishedScreen from "./FinishedScreen";
import { useTriviaGenerator } from "./generator";
import GuessingScreen from "./GuessingScreen";
import RevealScreen from "./RevealScreen";
import SetupScreen from "./SetupScreen";
import { checkAnswer, defaultSettings } from "./util";
import NitroAd from "../components/ads/NitroAd";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { useGuesser } from "../components/quiz/useGuesser";
import { getLocalStore } from "../database/localDB";

const GUESSER_ID = "trivia";

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
    const generator = useTriviaGenerator(settings);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (guesser.phase !== "loading") return;
        if (initializedRef.current) return;
        guesser.registerGenerator(generator);
        guesser.registerChecker(checkAnswer);
        guesser.next();
        initializedRef.current = true;
    }, [guesser, generator]);

    if (guesser.phase === "loading")
        return <LoadingContentPageTemplate />

    if (guesser.phase === "guessing")
        return <GuessingScreen settings={settings} guesser={guesser} submitAnswer={guesser.submitGuess} skip={guesser.skip} />

    if (guesser.phase === "reveal")
        return <RevealScreen settings={settings} guesser={guesser} next={guesser.next} />

    if (guesser.phase === "finished")
        return <FinishedScreen settings={settings} guesser={guesser} onPlayAgain={() => initializedRef.current = false}/>
}

export default function CommunityTriviaPage() {
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