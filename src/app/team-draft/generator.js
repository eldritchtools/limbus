import { egoRankMapping } from "../lib/constants";

function pickRandom(list) {
    if (list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
}

function pickMultiple(list, num) {
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

function pickRandomWithEmptyChance(list, chance) {
    if (Math.random() * 100 < chance) return null;
    return pickRandom(list);
}

function wbFilter(id, wbState) {
    if (wbState.mode === "b") {
        return !wbState.list.includes(id);
    } else if (wbState.mode === "w") {
        return wbState.list.includes(id);
    } else {
        return true;
    }
}

function constructEgoOptsMap() {
    return { "ZAYIN": [], "TETH": [], "HE": [], "WAW": [], "ALEPH": [] };
}

export function generateChoices(settings, wbState, identitiesData, egosData, identities, egos, blocked, addBlocked) {
    if (settings.randomizationRule === "strict") {
        const wbIdentities = Object.entries(identitiesData).filter(([id]) => wbFilter(id, wbState))

        const sinnerOpts = identities.map((x, i) =>
            (x === null && wbIdentities.some(([, data]) => data.sinnerId === i + 1)) ? i + 1 : null
        ).filter(x => x);
        const sinnerId = pickRandom(sinnerOpts);

        const identityOpts =
            wbIdentities
                .filter(([, data]) => data.sinnerId === sinnerId)
                .map(([id]) => id)

        const pickedIds = pickMultiple(identityOpts, settings.choices);

        const egoOpts =
            Object.entries(egosData)
                .filter(([, data]) => data.sinnerId === sinnerId)
                .filter(([id]) => wbFilter(id, wbState))
                .reduce((acc, [id, data]) => {
                    acc[data.rank].push(id);
                    return acc;
                }, constructEgoOptsMap());

        return pickedIds.map(id => [
            id,
            pickRandom(egoOpts["ZAYIN"]),
            pickRandomWithEmptyChance(egoOpts["TETH"], settings.emptyEgoProb),
            pickRandomWithEmptyChance(egoOpts["HE"], settings.emptyEgoProb),
            pickRandomWithEmptyChance(egoOpts["WAW"], settings.emptyEgoProb),
            pickRandomWithEmptyChance(egoOpts["ALEPH"], settings.emptyEgoProb),
        ]);
    }

    if (settings.randomizationRule === "standard") {
        const wbIdentities = Object.entries(identitiesData).filter(([id]) => wbFilter(id, wbState))

        const sinnerOpts = identities.map((x, i) =>
            (x === null && wbIdentities.some(([, data]) => data.sinnerId === i + 1)) ? i + 1 : null
        ).filter(x => x);

        const identityOptsPreBlock = wbIdentities.filter(([, data]) => sinnerOpts.includes(data.sinnerId))

        const identityOptsPostBlock = identityOptsPreBlock.filter(([id]) => !blocked.has(id))
        const identityOpts = (identityOptsPostBlock.length < settings.choices ? identityOptsPreBlock : identityOptsPostBlock).map(([id]) => id);

        const pickedIds = pickMultiple(identityOpts, settings.choices);
        addBlocked(pickedIds);

        return pickedIds.map(id => {
            const sinnerId = identitiesData[id].sinnerId;

            const egoOpts =
                Object.entries(egosData)
                    .filter(([, data]) => data.sinnerId === sinnerId)
                    .filter(([id]) => wbFilter(id, wbState))
                    .reduce((acc, [id, data]) => {
                        acc[data.rank].push(id);
                        return acc;
                    }, constructEgoOptsMap());

            return [
                id,
                pickRandom(egoOpts["ZAYIN"]),
                pickRandomWithEmptyChance(egoOpts["TETH"], settings.emptyEgoProb),
                pickRandomWithEmptyChance(egoOpts["HE"], settings.emptyEgoProb),
                pickRandomWithEmptyChance(egoOpts["WAW"], settings.emptyEgoProb),
                pickRandomWithEmptyChance(egoOpts["ALEPH"], settings.emptyEgoProb),
            ]
        });
    }

    if (settings.randomizationRule === "chaos") {
        const sinnerOpts = identities.map((x, i) => x === null ? i + 1 : null).filter(x => x);

        const identityOptsPreBlock =
            Object.entries(identitiesData)
                .filter(([, data]) => sinnerOpts.includes(data.sinnerId))
                .filter(([id]) => wbFilter(id, wbState))

        const identityOptsPostBlock = identityOptsPreBlock.filter(([id]) => !blocked.has(id))
        const identityOpts = (identityOptsPostBlock.length < settings.choices ? identityOptsPreBlock : identityOptsPostBlock).map(([id]) => id);

        const pickedIds = pickMultiple(identityOpts, settings.choices);
        addBlocked(pickedIds);

        const egoOpts =
            Object.entries(egosData)
                .filter(([, data]) => egos[data.sinnerId - 1][egoRankMapping[data.rank]] === null)
                .filter(([id]) => wbFilter(id, wbState))
                .reduce((acc, [id, data]) => {
                    acc[data.rank].push(id);
                    return acc;
                }, constructEgoOptsMap());

        return pickedIds.map(id => [
            id,
            pickRandom(egoOpts["ZAYIN"]),
            pickRandomWithEmptyChance(egoOpts["TETH"], settings.emptyEgoProb),
            pickRandomWithEmptyChance(egoOpts["HE"], settings.emptyEgoProb),
            pickRandomWithEmptyChance(egoOpts["WAW"], settings.emptyEgoProb),
            pickRandomWithEmptyChance(egoOpts["ALEPH"], settings.emptyEgoProb),
        ]);
    }

    return [];
}