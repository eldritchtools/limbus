export const encounterCategoryLabels = {
    "md": "Mirror Dungeon",
    "reflectrial": "Reflectrial",
    "story": "Story",
    "luxcavation": "Luxcavation",
    "rr": "Refraction Railway"
};

export function encounterToOption(id, name) {
    return {
        value: id,
        label: <span>{name} <span className="sub-text">({id})</span></span>,
        name: name,
        altName: id
    };
}

export function getEncounterCategoryOptions(withTagsOnly = false) {
    return Object.entries(encounterCategoryLabels)
        .filter(([cat]) => !withTagsOnly || cat !== "md")
        .map(([cat, label]) => ({ value: cat, label: label }));
}

export function getEncounterOptions(encounters, category) {
    return Object.entries(encounters[category.value]).map(([id, name]) => encounterToOption(id, name));
}
