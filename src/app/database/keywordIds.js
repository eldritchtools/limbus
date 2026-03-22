export const keywordToIdMapping = {
    "Burn": 1,
    "Bleed": 2,
    "Tremor": 3,
    "Rupture": 4,
    "Sinking": 5,
    "Poise": 6,
    "Charge": 7,
    "wrath": 8,
    "lust": 9,
    "sloth": 10,
    "gluttony": 11,
    "gloom": 12,
    "pride": 13,
    "envy": 14,
    "slash": 15,
    "pierce": 16,
    "blunt": 17,
    "guard": 18,
    "evade": 19,
    "counter": 20
}

export const keywordIdMapping = Object.fromEntries(
    Object.entries(keywordToIdMapping).map(([key, value]) => [value, key])
);
