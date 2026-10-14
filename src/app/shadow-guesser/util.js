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
    gifts: { label: "E.G.O Gifts", dataPath: "gifts" },
    gmsItem: { label: "GMS Items", dataPath: "rpg/items" }
}

export const additionalInfoLabels = ["None", "Low", "Medium", "High"];

export function answerToText(ans, data) {
    const { category, answer } = ans;
    if (category === "gifts")
        return `[${categories[category].label}] ${data[category][answer].names[0]}`;
    else
        return `[${categories[category].label}] ${data[category][answer].name}`;
}

export function checkAnswer(answer, problem) {
    return answer.category === problem.category && answer.answer === problem.answer;
}