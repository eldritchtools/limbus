export function fuzzyScore(query, target) {
    query = query.toLowerCase();
    target = target.toLowerCase();

    let qi = 0;
    let score = 0;

    for (let ti = 0; ti < target.length && qi < query.length; ti++) {
        if (target[ti] === query[qi]) {
            score += 2;
            if (ti === qi) score += 1;
            qi++;
        } else {
            score -= 1;
        }
    }

    return qi === query.length ? score : -Infinity;
}

export function paragraphScore(query, text) {
    const queryTokens = query.toLowerCase().trim().split(/\s+/);
    const textTokens = text.toLowerCase().trim().split(/\s+/);

    let matches = 0;
    for (const token of queryTokens) {
        matches += textTokens.filter(t => t === token).length;
    }

    let adjacencyBonus = 0;
    for (let i = 0; i < queryTokens.length - 1; i++) {
        for (let j = 0; j < textTokens.length - 1; j++) {
            if (textTokens[j] === queryTokens[i] && textTokens[j + 1] === queryTokens[i + 1]) {
                adjacencyBonus += 0.5; // small boost
            }
        }
    }

    const baseScore = matches / textTokens.length;
    return baseScore + adjacencyBonus;
}
