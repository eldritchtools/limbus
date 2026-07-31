import { useData } from "../components/DataProvider";

const DIFFICULTY = {
    easy: {
        start: "start",
        duration: 100000
    },
    normal: {
        start: "start",
        duration: 3
    },
    hard: {
        start: "random",
        duration: 2,
        speechRatio: 0.75
    },
    distort: {
        start: "random",
        duration: 1,
        speechRatio: 0.85
    }
};

function pickRandom(list) {
    if (list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
}

function getSpeechDuration(start, duration, speechRegions) {
    const end = start + duration;

    let speech = 0;

    for (const [regionStart, regionEnd] of speechRegions) {
        const overlap =
            Math.max(
                0,
                Math.min(end, regionEnd) -
                Math.max(start, regionStart)
            );

        speech += overlap;
    }

    return speech;
}

export function generateClip(difficulty, voicelineData) {
    const config = DIFFICULTY[difficulty];

    let start = 0;
    if (config.start === "random") {
        const maxStart = Math.max(0, voicelineData.speechEnd - config.duration);
        if (maxStart === 0) return { start: 0, duration: config.duration };

        const attempts = Math.max(20, Math.ceil(maxStart * 5));
        const speechTarget = config.duration * config.speechRatio;

        let bestStart = 0;
        let bestSpeech = -1;
        for (let i = 0; i < attempts; i++) {
            const candidate = Math.random() * maxStart;

            const speech = getSpeechDuration(
                candidate,
                config.duration,
                voicelineData.speechRegions
            );

            if (speech > bestSpeech) {
                bestSpeech = speech;
                bestStart = candidate;
            }

            if (speech >= speechTarget) break;
        }

        start = bestStart;
    }

    return {
        start: Math.round(start * 1000) / 1000,
        duration: config.duration
    };
}

const MODIFIERS = {
    easy: [{ type: "none" }],
    normal: [{ type: "none" }],
    hard: [{ type: "none" }],
    distort: [
        { type: "speed up" },
        { type: "slow down" },
        { type: "muffle" },
        { type: "telephone" }
    ],
};

export function generateModifier(difficulty) {
    const list = MODIFIERS[difficulty];
    const modifier = list[Math.floor(Math.random() * list.length)]

    return { ...modifier };
}

export function generateVoicelineQuiz(egoVoicelines, settings) {
    const answers = [...Object.keys(egoVoicelines)].sort(() => 0.5 - Math.random()).slice(0, settings.rounds);
    const problems = answers.map(answer => {
        const voicelineId = pickRandom([...Object.keys(egoVoicelines[answer])]);

        return {
            answer: answer,
            id: voicelineId,
            dlg: egoVoicelines[answer][voicelineId].dlg,
            clip: generateClip(settings.difficulty, egoVoicelines[answer][voicelineId]),
            modifier: generateModifier(settings.difficulty)
        }
    });

    return {
        title: "Voiceline Guess",
        problems,
    };
}

export function useVoicelineQuizGenerator(settings) {
    const [egoVoicelines, egoVoicelinesLoading] = useData("ego_voicelines");

    if (settings.mode === "daily") {
        return async () => {
            const response = await fetch("/api/dailies/voiceline");
            return await response.json();
        }
    }

    if (settings.mode === "standard") {
        if (egoVoicelinesLoading) return null;

        return () => generateVoicelineQuiz(egoVoicelines, settings);
    }

    return null;
}
