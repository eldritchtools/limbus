"use client";

import { useEffect, useMemo, useState } from "react";

import FinishedScreen from "./FinishedScreen";
import { useShadowGuesserGenerator } from "./generator";
import GuessingScreen from "./GuessingScreen";
import RevealScreen from "./RevealScreen";
import SetupScreen from "./SetupScreen";
import { answerToText, categories, checkAnswer, defaultSettings } from "./util";
import NitroAd from "../components/ads/NitroAd";
import { useData } from "../components/DataProvider";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { useGuesser } from "../components/quiz/useGuesser";
import { getLocalStore } from "../database/localDB";
import { buildSearchStrings } from "../lib/filter";

const GUESSER_ID = "shadow";

function SetupWrapper({ settings, setSettings, guesser, shadowData }) {
    const handleSetSettings = async (valueOrFn) => {
        const newSettings = typeof valueOrFn === "function" ? valueOrFn(settings) : valueOrFn;
        await getLocalStore("guessers").save({ id: GUESSER_ID, ...newSettings });
        setSettings(newSettings);
    }

    return <SetupScreen
        settings={settings}
        setSettings={handleSetSettings}
        shadowData={shadowData}
        onStart={() => guesser.start(settings)}
        onReset={() => handleSetSettings(defaultSettings)}
    />
}

function Guesser({ settings, guesser, shadowData }) {
    const [generator, data, loading] = useShadowGuesserGenerator(settings, shadowData);
    const [altNames, altLoading] = useData("alt_names")

    useEffect(() => {
        if (guesser.phase !== "loading" || loading) return;
        guesser.registerGenerator(generator);
        guesser.registerChecker(checkAnswer);
        guesser.next();
    }, [guesser, generator, loading]);

    const options = useMemo(() => {
        if (loading || altLoading) return [];
        const options = [];
        settings.categories.forEach(cat => {
            if (categories[cat].useShadowData) {
                shadowData[cat].items.forEach(id => {
                    const option = { category: cat, answer: id };
                    switch (cat) {
                        case "ids":
                            option.label = answerToText(option, data)
                            option.searchStrings = buildSearchStrings(data[cat][id], altNames)
                            break;
                        case "ego":
                            option.label = answerToText(option, data)
                            option.searchStrings = buildSearchStrings(data[cat][id], altNames)
                            break;
                    }
                    options.push(option);
                })
            } else {
                Object.entries(data[cat]).forEach(([id, item]) => {
                    const option = { category: cat, answer: id };
                    switch (cat) {
                        case "gifts":
                            option.label = `[${categories[cat].label}] ${item.names[0]}`;
                            option.searchStrings = [item.names[0]];
                            break;
                        case "gmsItem":
                            option.label = `[${categories[cat].label}] ${item.name}`;
                            option.searchStrings = [item.name];
                            break;
                    }
                    options.push(option);
                })
            }
        })
        return options;
    }, [data, shadowData, altNames, altLoading, loading, settings.categories]);

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
    const [shadowData, shadowDataLoading] = useData("shadow_guesser");
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

    if (shadowDataLoading) return <LoadingContentPageTemplate />

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <NitroAd id={"minigame-top-ad"} height={90} adLevel={"min"} style={{ width: "100%" }} />

        {guesser.phase === "setup" ?
            <SetupWrapper settings={settings} setSettings={setSettings} guesser={guesser} shadowData={shadowData} /> :
            <Guesser settings={settings} guesser={guesser} shadowData={shadowData} />
        }
    </div>;
}