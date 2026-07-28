function cleanText(text = "") {
    if (!text) return "";

    return text
        // .replace(/\{.*?\}/g, "")
        // .replace(/[#_*`>]/g, "")
        .replace(/\s+/g, " ")
        .trim()
}

function getWordCount(text = "") {
    return cleanText(text).split(" ").length;
}

export function checkBuildIndexable(body, sinnerNotes) {
    let totalCount = getWordCount(body);
    if(sinnerNotes) sinnerNotes.forEach(note => {
        if (note) totalCount += getWordCount(note);
    });
    return totalCount >= 200;
}

export function checkMdPlanIndexable(body, sinnerNotes, floors) {
    let totalCount = getWordCount(body);
    if (sinnerNotes) sinnerNotes.forEach(note => {
        if (note) totalCount += getWordCount(note);
    });
    floors.forEach(({ note }) => {
        if (note) totalCount += getWordCount(note);
    })
    return totalCount >= 200;
}