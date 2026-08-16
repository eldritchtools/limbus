import { useRef, useState } from "react";

import { useAuth } from "@/app/database/authProvider";
import { constructDefaultDailyStats, getDailyQuizStats, updateDailyQuizStats } from "@/app/database/dailyQuizzes";
import { getLocalStore } from "@/app/database/localDB";
import { triggerGameCompleteGAEvent, triggerGameStartGAEvent } from "@/app/lib/gaEvents";

// phases
// setup, loading, guessing, reveal, finished

export function useQuiz(id, generateQuiz) {
    const { user } = useAuth();
    const [phase, setPhase] = useState("setup");
    const [quiz, setQuiz] = useState(null);
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState(null);
    const [results, setResults] = useState(null);
    const [settings, setSettings] = useState(null);
    const [dailyStats, setDailyStats] = useState(null);
    const [problem, setProblem] = useState(null);
    const [currentAnswer, setCurrentAnswer] = useState(null);
    const generateQuizRef = useRef(generateQuiz);

    async function start(startSettings) {
        triggerGameStartGAEvent(id, startSettings.mode);
        setPhase("loading");
        setSettings(startSettings);
        const generated = await generateQuizRef.current(startSettings);
        setQuiz(generated);
        setProblem(generated.problems[0]);
        setCurrentAnswer(generated.problems[0].answer);

        if (startSettings.mode === "standard") {
            setRound(0);
            setScore(0);
            setAnswers([]);
            setResults([]);
            setPhase("guessing");
        } else if (startSettings.mode === "daily") {
            let stats;
            if (user) {
                stats = (await getDailyQuizStats(id)) ?? constructDefaultDailyStats();
                setDailyStats(stats);
            } else {
                stats = (await getLocalStore("dailyQuizzes").get(id)) ?? constructDefaultDailyStats();
                setDailyStats(stats);
            }

            if (stats.last_completed_date === generated.date) {
                setPhase("finished");
            } else {
                setRound(0);
                setScore(0);
                setAnswers([]);
                setResults([]);
                setPhase("guessing");
            }
        }
    }

    async function updateDailyStats(correct) {
        if (user) {
            const update = await updateDailyQuizStats(id, quiz.date, correct);
            setDailyStats(p => ({
                ...p,
                ...(update[0]),
                last_completed_date: quiz.date,
                last_completed_correct: correct
            }));
        } else {
            const newDailyStats = {
                ...dailyStats,
                id: id,
                last_completed_date: quiz.date,
                last_completed_correct: correct,
                quizzes_played: dailyStats.quizzes_played + 1,
                quizzes_correct: dailyStats.quizzes_correct + (correct ? 1 : 0)
            };
            setDailyStats(newDailyStats);

            await getLocalStore("dailyQuizzes").save(newDailyStats);
        }
    }

    async function submitGuess(answer) {
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);
        if (answer === currentAnswer) {
            setScore(s => s + 1);
            setResults(p => [...p, true]);
            if (settings.mode === "daily") updateDailyStats(true);
            setPhase("reveal");
        } else if (newAnswers.length >= settings.guesses) {
            setResults(p => [...p, false]);
            if (settings.mode === "daily") updateDailyStats(false);
            setPhase("reveal");
        }
    }

    async function next() {
        if (settings.infinite) {
            const newQuiz = await generateQuizRef.current(settings);
            setRound(r => r + 1);
            setAnswers([]);
            setQuiz(newQuiz);
            setProblem(newQuiz.problems[0]);
            setCurrentAnswer(newQuiz.problems[0].answer);
            setPhase("guessing");
            return;
        }

        if (round + 1 >= quiz.problems.length) {
            triggerGameCompleteGAEvent(id, settings.mode);
            setPhase("finished");
            return;
        }

        setRound(r => r + 1);
        setAnswers([]);
        setProblem(quiz.problems[round + 1]);
        setCurrentAnswer(quiz.problems[round + 1].answer);
        setPhase("guessing");
    }

    function skip() {
        setResults(p => [...p, false]);
        setPhase("reveal");
    }

    function returnToSetup() {
        setPhase("setup");
    }

    function registerGenerator(generator) {
        generateQuizRef.current = generator;
    }

    function setFields(fields) {
        if ("phase" in fields) setPhase(fields.phase);
        if ("round" in fields) setRound(fields.round);
        if ("score" in fields) setScore(fields.score);
        if ("problem" in fields) setProblem(fields.problem);
        if ("currentAnswer" in fields) setCurrentAnswer(fields.currentAnswer);
        if ("answers" in fields) setAnswers(fields.answers);
    }

    async function generateProblem() {
        return (await generateQuizRef.current(settings)).problems[0];
    }

    return {
        phase, quiz, problem, currentAnswer, round, score, answers, results, settings, dailyStats,
        start, submitGuess, skip, next, returnToSetup, registerGenerator, setFields, generateProblem
    };
}
