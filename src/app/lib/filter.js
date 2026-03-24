import { filterCategories } from "../components/selectors/IconsSelector";

export function normalizeString(str) {
    return str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function checkFilterMatch(str, searchStrings = []) {
    const normStr = normalizeString(str);
    const search = Array.isArray(searchStrings) ? searchStrings : [searchStrings];

    for (let i = 0; i < search.length; i++) {
        if (normalizeString(search[i]).includes(normStr)) return true;
    }
    return false;
}

const keywordStatusMapping = {
    "Burn": "Combustion",
    "Bleed": "Laceration",
    "Tremor": "Vibration",
    "Rupture": "Burst",
    "Sinking": "Sinking",
    "Poise": "Breath",
    "Charge": "Charge"
};

const identityFilterMatchFunctions = {
    "identityTier": (filter, item) => filter.length === item.rank,
    "affinity": (filter, item) => item.skillTypes.some(s => s.type.affinity === filter) || item.defenseSkillTypes.some(s => s.type.affinity === filter),
    "skillType": (filter, item) => item.skillTypes.some(s => s.type.type === filter.toLowerCase()) || item.defenseSkillTypes.some(s => s.type.type === filter.toLowerCase()),
    "status": (filter, item) => (item.skillKeywordList || []).includes(filter),
    "sinner": (filter, item) => filter === item.sinnerId
}

const egoFilterMatchFunctions = {
    "egoTier": (filter, item) => filter === item.rank.toLowerCase(),
    "affinity": (filter, item) => item.awakeningType.affinity === filter || item.corrosionType?.affinity === filter,
    "skillType": (filter, item) => item.awakeningType.type === filter.toLowerCase() || item.corrosionType?.type === filter.toLowerCase(),
    "status": (filter, item) => item.statuses.includes(keywordStatusMapping[filter]),
    "sinner": (filter, item) => filter === item.sinnerId
}

export function filterByFilters(type, items, filters, additionalFilter) {
    const [f, fe] = filters.reduce(([f, fe], filter) => {
        const exc = filter[0] === "-";
        let realFilter = exc ? filter.slice(1) : filter;
        if (Number.isInteger(Number(realFilter)) && Number(realFilter) > 0) realFilter = Number(realFilter);

        if (exc) {
            if (filterCategories[realFilter] in fe) fe[filterCategories[realFilter]].push(realFilter);
            else fe[filterCategories[realFilter]] = [realFilter];
        } else {
            if (filterCategories[realFilter] in f) f[filterCategories[realFilter]].push(realFilter);
            else f[filterCategories[realFilter]] = [realFilter];
        }

        return [f, fe];
    }, [[], []]);

    return items.filter(item => {
        if (!additionalFilter(item)) return false;

        for (const filterType in f) {
            if (type === "identity") {
                if (!f[filterType].some(x => identityFilterMatchFunctions[filterType](x, item))) return false;
            } else if (type === "ego") {
                if (!f[filterType].some(x => egoFilterMatchFunctions[filterType](x, item))) return false;
            }
        }

        for (const filterType in fe) {
            if (type === "identity") {
                if (fe[filterType].some(x => identityFilterMatchFunctions[filterType](x, item))) return false;
            } else if (type === "ego") {
                if (fe[filterType].some(x => egoFilterMatchFunctions[filterType](x, item))) return false;
            }
        }
        return true;
    });
}