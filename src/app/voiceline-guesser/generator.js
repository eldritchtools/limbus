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
        duration: 2
    },
    distort: {
        start: "random",
        duration: 1
    }
};

function pickRandom(list) {
    if (list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
}

export function generateClip(difficulty, voicelineData) {
    const config = DIFFICULTY[difficulty];

    let start = 0;
    if (config.start === "random") {
        const maxStart = Math.max(0, voicelineData.speechEnd - config.duration);
        start = Math.random() * maxStart;
    }

    return {
        start: start,
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
