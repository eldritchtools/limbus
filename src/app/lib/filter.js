export function normalizeString(str) {
    return str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function checkFilterMatch(str, searchStrings = []) {
    const normStr = normalizeString(str);
    const search = Array.isArray(searchStrings) ? searchStrings : [searchStrings];

    for (const string in search)
        if (normalizeString(string).includes(normStr)) return true;
    return false;
}
