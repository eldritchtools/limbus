export const keywords = ["Burn", "Bleed", "Tremor", "Rupture", "Sinking", "Poise", "Charge", "Slash", "Pierce", "Blunt", "Keywordless"];

export const romanMapping = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X" };

export const sinnerIdMapping = {
    1: "Yi Sang",
    2: "Faust",
    3: "Don Quixote",
    4: "Ryōshū",
    5: "Meursault",
    6: "Hong Lu",
    7: "Heathcliff",
    8: "Ishmael",
    9: "Rodion",
    10: "Sinclair",
    11: "Outis",
    12: "Gregor"
}

export const seasonMapping = {
    0: "Standard Fare",
    1: "1 - Orientation",
    2: "2 - Reminiscence",
    3: "3 - Bon Voyage",
    4: "4 - Clear All Cathy",
    5: "5 - Oblivion",
    6: "6 - Zàng Huā Yín",
    7: "7 - Kumo no ito • oti on akA",
    8000: "Pilgrimage of Compassion"
}

export const egoRanks = ["ZAYIN", "TETH", "HE", "WAW", "ALEPH"];

export const LEVEL_CAP = 60;

export function getSeasonString(season) {
    if (season > 9100) return `Walpurgisnacht ${season - 9100}`;
    else return seasonMapping[season];
}

export const typePageMapping = {
    "build": "builds",
    "collection": "collections",
    "md_plan": "md-plans"
}