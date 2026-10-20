import { useCallback, useMemo, useRef, useState } from "react";

import { triggerGameCompleteGAEvent, triggerGameStartGAEvent } from "@/app/lib/gaEvents";

// phases
// setup, loading, guessing, reveal, finished

export function useGuesser(id) {
    const [phase, setPhase] = useState("setup");
    const [problems, setProblems] = useState([]);
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState(null);
    const [results, setResults] = useState(null);
    const [settings, setSettings] = useState({});
    const generateRef = useRef(null);
    const checkAnswerRef = useRef(null);

    const start = useCallback(async startSettings => {
        triggerGameStartGAEvent(id, startSettings.mode);
        setPhase("loading");
        setSettings(startSettings);
        setProblems([]);
        setRound(0);
        setScore(0);
        setAnswers([]);
        setResults([]);
    }, [id]);

    const currentProblem = useMemo(() => problems[problems.length - 1], [problems]);

    const submitGuess = useCallback(async answer => {
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);
        if (checkAnswerRef.current(answer, currentProblem)) {
            setScore(s => s + 1);
            if (settings.infinite) setResults([true]);
            else setResults(p => [...p, true]);
            setPhase("reveal");
        } else if (newAnswers.length >= (settings.guesses ?? 1)) {
            if (settings.infinite) setResults([false]);
            else setResults(p => [...p, false]);
            setPhase("reveal");
        }
    }, [currentProblem, answers, settings]);

    const next = useCallback(async () => {
        const generated = await generateRef.current();

        if (settings.infinite) {
            setProblems([generated]);
            setRound(p => p + 1);
            setAnswers([]);
            setPhase("guessing");
            return;
        }

        if (problems.length >= settings.rounds) {
            triggerGameCompleteGAEvent(id, settings.mode);
            setPhase("finished");
            return;
        }

        setProblems(p => ([...p, generated]));
        setRound(p => p + 1);
        setAnswers([]);
        setPhase("guessing");
    }, [id, settings, problems])

    const skip = useCallback(async () => {
        if (!settings.infinite) setResults(p => [...p, false]);
        setPhase("reveal");
    }, [settings.infinite]);

    const returnToSetup = useCallback(() => {
        setPhase("setup");
    }, []);

    const registerGenerator = useCallback(generator => {
        generateRef.current = generator;
    }, []);

    const registerChecker = useCallback(checker => {
        checkAnswerRef.current = checker;
    }, []);

    const setFields = useCallback(fields => {
        if ("phase" in fields) setPhase(fields.phase);
        if ("problems" in fields) setProblems(fields.problems);
        if ("round" in fields) setRound(fields.round);
        if ("score" in fields) setScore(fields.score);
        if ("answers" in fields) setAnswers(fields.answers);
        if ("results" in fields) setResults(fields.results);
        if ("settings" in fields) setSettings(fields.settings);
    }, []);

    return {
        phase, problems, round, score, answers, results, settings, currentProblem,
        start, submitGuess, skip, next, returnToSetup, registerGenerator, registerChecker, setFields
    };
}
