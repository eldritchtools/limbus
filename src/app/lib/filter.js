import { filterCategories } from "../components/selectors/IconsSelector";

export function normalizeString(str) {
    return str.replace(/<\/?[^>]+>/g, "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
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
    "sinner": (filter, item) => filter === item.sinnerId,
    "statusFull": (filter, item) => (item.statuses || []).includes(filter),
    "tag": (filter, item) => (item.tags || []).includes(filter),
    "season": (filter, item) => filter === item.season || (filter === 9100 && item.season > 9100)
};

const egoFilterMatchFunctions = {
    "egoTier": (filter, item) => filter === item.rank.toLowerCase(),
    "affinity": (filter, item) => item.awakeningType.affinity === filter || item.corrosionType?.affinity === filter,
    "skillType": (filter, item) => item.awakeningType.type === filter.toLowerCase() || item.corrosionType?.type === filter.toLowerCase(),
    "status": (filter, item) => item.statuses.includes(keywordStatusMapping[filter]),
    "sinner": (filter, item) => filter === item.sinnerId,
    "statusFull": (filter, item) => (item.statuses || []).includes(filter),
    "season": (filter, item) => filter === item.season || (filter === 9100 && item.season > 9100)
};

const giftFilterMatchFunctions = {
    "giftTier": (filter, item) => filter === item.tier,
    "status": (filter, item) => filter === item.keyword,
    "skillType": (filter, item) => filter === item.keyword,
    "keywordless": (filter, item) => filter === item.keyword,
    "affinity": (filter, item) => filter === item.affinity,
    "tag": (filter, item) => {
        if (filter === "Enhanceable") {
            if (item.enhanceable) return true;
        } else if (filter === "Ingredient") {
            if (item.ingredientOf) return true;
        } else if (filter === "Fusion Only") {
            if (item.fusion) return true;
        } else if (filter === "Hard Only") {
            if (item.hardonly) return true;
        } else if (filter === "Event Reward") {
            if (item.events) return true;
        } else if (filter === "Pack Exclusive") {
            if (item.exclusiveTo) return true;
        } else if (filter === "Hidden") {
            if (item.hidden) return true;
        } else if (filter === "Cursed") {
            if (item.cursedPair) return true;
        } else if (filter === "Blessed") {
            if (item.blessedPair) return true;
        }
        return false;
    }
};

export function filterByFilters(type, items, filters, additionalFilter, strictFiltering = false) {
    const [f, fe] = filters.reduce(([f, fe], filter) => {
        let exc, realFilter, category;

        if (Array.isArray(filter)) {
            exc = filter[1][0] === "-";
            realFilter = exc ? filter[1].slice(1) : filter[1];
            category = filter[0];
            if (category === "season") realFilter = Number(realFilter);
        } else {
            exc = filter[0] === "-";
            realFilter = exc ? filter.slice(1) : filter;
            category = filterCategories[realFilter];
            if (type !== "gift" && category === "giftTier") category = "sinner";
            if (category === "sinner") realFilter = Number(realFilter);
        }

        if (exc) {
            if (category in fe) fe[category].push(realFilter);
            else fe[category] = [realFilter];
        } else {
            if (category in f) f[category].push(realFilter);
            else f[category] = [realFilter];
        }

        return [f, fe];
    }, [[], []]);

    return items.filter(item => {
        if (!additionalFilter(item)) return false;
        if (item.upcoming) return false;

        for (const filterType in f) {
            if (type === "identity") {
                if (!(filterType in identityFilterMatchFunctions)) continue;

                if (strictFiltering) {
                    if (!f[filterType].every(x => identityFilterMatchFunctions[filterType](x, item))) return false;
                } else {
                    if (!f[filterType].some(x => identityFilterMatchFunctions[filterType](x, item))) return false;
                }
            } else if (type === "ego") {
                if (!(filterType in egoFilterMatchFunctions)) continue;

                if (strictFiltering) {
                    if (!f[filterType].every(x => egoFilterMatchFunctions[filterType](x, item))) return false;
                } else {
                    if (!f[filterType].some(x => egoFilterMatchFunctions[filterType](x, item))) return false;
                }
            } else if (type === "gift") {
                if (!(filterType in giftFilterMatchFunctions)) continue;

                if (!f[filterType].some(x => giftFilterMatchFunctions[filterType](x, item))) return false;
            }
        }

        for (const filterType in fe) {
            if (type === "identity") {
                if (!(filterType in identityFilterMatchFunctions)) continue;
                if (fe[filterType].some(x => identityFilterMatchFunctions[filterType](x, item))) return false;
            } else if (type === "ego") {
                if (!(filterType in egoFilterMatchFunctions)) continue;
                if (fe[filterType].some(x => egoFilterMatchFunctions[filterType](x, item))) return false;
            } else if (type === "gift") {
                if (!(filterType in giftFilterMatchFunctions)) continue;
                if (fe[filterType].some(x => giftFilterMatchFunctions[filterType](x, item))) return false;
            }
        }
        return true;
    });
}