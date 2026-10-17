import { useCallback, useEffect, useRef, useState } from "react";

import { categories } from "./util";
import { useDataMultiple } from "../components/DataProvider";
import { affinities } from "../lib/constants";

function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function constructProblem(category, id, data) {
    const base = { category: category, answer: id };
    switch (category) {
        case "ids":
            const randomSkill = data.skillTypes[Math.floor(Math.random() * data.skillTypes.length)];
            return { ...base, sampleSkillType: { affinity: randomSkill.type.affinity, type: randomSkill.type.type } };
        case "ego":
            return {
                ...base,
                resists: shuffle(affinities).slice(0, 3).reduce((acc, aff) => {
                    acc[aff] = data.resists[aff];
                    return acc;
                }, {}),
                costs: shuffle(affinities).slice(0, 3).reduce((acc, aff) => {
                    acc[aff] = data.cost[aff] ?? 0;
                    return acc;
                }, {}),
                skillType: { affinity: data.awakeningType.affinity, type: data.awakeningType.type }
            };
        case "gifts": case "gmsItems": default:
            return base;
    }
}

export function useShadowGuesserGenerator(settings, shadowData) {
    const [dataUnmapped, dataLoading] = useDataMultiple((settings.categories ?? []).map(x => categories[x].dataPath));
    const data = useMemo(() => {
        if (dataLoading) return {};
        return settings.categories.reduce((acc, cat) => {
            acc[cat] = dataUnmapped[categories[cat].dataPath];
            return acc;
        }, {});
    }, [settings, dataUnmapped, dataLoading]);

    const [categoryNext, setCategoryNext] = useState({});
    const [shuffled, setShuffled] = useState({});
    const [loading, setLoading] = useState(true);

    const categoryNextRef = useRef(categoryNext);
    const shuffledRef = useRef(shuffled);

    const shuffleAnswers = useCallback(() => {
        if (dataLoading) return {};

        return (settings.categories ?? []).reduce((acc, category) => {
            if (categories[category].useShadowData) {
                acc[category] = shuffle(shadowData[category].items);
            } else {
                acc[category] = shuffle(Object.keys(data[category]));
            }
            return acc;
        }, {});
    }, [data, dataLoading, shadowData, settings.categories]);

    useEffect(() => {
        if (!dataLoading) {
            setShuffled(() => {
                const newValue = shuffleAnswers()
                shuffledRef.current = newValue;
                return newValue;
            });
            setLoading(false);
        }
    }, [dataLoading, shuffleAnswers]);

    const generateProblem = useCallback(async () => {
        let allowed = settings.categories.filter(x => (categoryNextRef.current[x] ?? 0) < shuffledRef.current[x].length);
        if (allowed.length === 0) {
            const newShuffle = shuffleAnswers();
            const category = settings.categories[Math.floor(Math.random() * settings.categories.length)];
            const answer = newShuffle[category][0];
            setCategoryNext(() => {
                const newValue = { [category]: 1 };
                categoryNextRef.current = newValue;
                return newValue;
            });
            setShuffled(() => {
                shuffledRef.current = newShuffle;
                return newShuffle;
            });
            return constructProblem(category, answer, data[category][answer]);
        } else {
            const category = allowed[Math.floor(Math.random() * allowed.length)];
            const answer = shuffledRef.current[category][categoryNextRef.current[category] ?? 0];
            setCategoryNext(p => {
                const newValue = { ...p, [category]: (p[category] ?? 0) + 1 };
                categoryNextRef.current = newValue;
                return newValue;
            });
            return constructProblem(category, answer, data[category][answer]);
        }
    }, [settings, shuffledRef, shuffleAnswers, categoryNextRef, data]);

    return [generateProblem, data, loading];
}