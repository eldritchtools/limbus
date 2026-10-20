import { useCallback, useRef, useState } from "react";

import { remapQuestion } from "./util";
import { getTriviaQuestions } from "../database/trivia";

function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function constructProblem(problem) {
    if (problem.answerType === "multiple_choice")
        return { ...problem, options: shuffle([problem.answer, ...problem.otherAnswers]) }

    return problem;
}

export function useTriviaGenerator(settings) {
    const [problems, setProblems] = useState(null);
    const problemsRef = useRef(problems);

    const generateProblem = useCallback(async () => {
        if (!problemsRef.current || problemsRef.current.length === 0) {
            const newProblems = (await getTriviaQuestions(settings.curated ? "curated" : "community", settings.rounds)).map(x => remapQuestion(x));
            const problem = newProblems[0];
            setProblems(newProblems.slice(1));
            problemsRef.current = newProblems.slice(1);
            return constructProblem(problem);
        } else {
            const problem = problemsRef.current[0];
            setProblems(p => p.slice(1));
            problemsRef.current = problemsRef.current.slice(1);
            return constructProblem(problem);
        }
    }, [settings]);

    return generateProblem;
}
