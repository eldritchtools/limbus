import { useCallback, useEffect, useRef, useState } from "react";

import { categories } from "./util";
import { useDataMultiple } from "../components/DataProvider";

function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

export function useShadowGuesserGenerator(settings) {
    const [dataUnmapped, dataLoading] = useDataMultiple((settings.categories ?? []).map(x => categories[x].dataPath));
    const data = useMemo(() => {
        if(dataLoading) return {};
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
            acc[category] = shuffle(Object.keys(data[category]))
            return acc;
        }, {});
    }, [data, dataLoading, settings.categories]);

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
            return { category, answer };

        } else {
            const category = allowed[Math.floor(Math.random() * allowed.length)];
            const answer = shuffledRef.current[category][categoryNextRef.current[category] ?? 0];
            setCategoryNext(p => {
                const newValue = { ...p, [category]: (p[category] ?? 0) + 1 };
                categoryNextRef.current = newValue;
                return newValue;
            });
            return { category, answer };
        }
    }, [settings, shuffledRef, shuffleAnswers, categoryNextRef]);

    return [generateProblem, data, loading];
}