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
            return `[${sinnerIdMapping[data[category][answer].sinnerId]}] ${data[category][answer].name}`
        case "ego": 
            return `[${sinnerIdMapping[data[category][answer].sinnerId]}] ${data[category][answer].name}`
        case "gifts":
            return `${data[category][answer].names[0]}`;
        case "gmsItem":
            return `${data[category][answer].name}`;
    }
}

export function constructLabel(category, label) {
    return <span style={{display: "flex", alignItems: "center", gap: "0.2rem", flexWrap: "wrap"}}>
        {label}
        <span className="sub-text">{categories[category].label}</span>
    </span>
}

export function checkAnswer(answer, problem) {
    return answer.category === problem.category && answer.answer === problem.answer;
}