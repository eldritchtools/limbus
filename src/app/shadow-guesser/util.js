import { sinnerIdMapping } from "../lib/constants";

export const defaultSettings = {
    mode: "standard",
    rounds: 10,
    guesses: 3,
    showCategory: false,
    additionalInfo: 0,
    categories: ["gifts"],
    infinite: false
};

export const categories = {
    ids: { label: "Identities", dataPath: "identities", useShadowData: true },
    ego: { label: "E.G.O Corrosions", dataPath: "egos", useShadowData: true },
    gifts: { label: "E.G.O Gifts", dataPath: "gifts" },
    gmsItem: { label: "GMS Items", dataPath: "rpg/items" }
}

export const additionalInfoLabels = ["None", "Low", "Medium", "High"];

export function answerToText(ans, data) {
    const { category, answer } = ans;
    switch (category) {
        case "ids": 
            return `[${categories[category].label}] [${sinnerIdMapping[data[category][answer].sinnerId]}] ${data[category][answer].name}`
        case "ego": 
            return `[${categories[category].label}] [${sinnerIdMapping[data[category][answer].sinnerId]}] ${data[category][answer].name}`
        case "gifts":
            return `[${categories[category].label}] ${data[category][answer].names[0]}`;
        case "gmsItem":
            return `[${categories[category].label}] ${data[category][answer].name}`;
    }
}

export function checkAnswer(answer, problem) {
    return answer.category === problem.category && answer.answer === problem.answer;
}