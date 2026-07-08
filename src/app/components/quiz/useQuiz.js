import { useState } from "react";

import { useAuth } from "@/app/database/authProvider";
import { constructDefaultDailyStats, getDailyQuizStats, updateDailyQuizStats } from "@/app/database/dailyQuizzes";
import { getLocalStore } from "@/app/database/localDB";

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
    const problem = quiz?.problems[settings?.infinite ? 0 : round];

    async function start(startSettings) {
        setPhase("loading");
        setSettings(startSettings);
        const generated = await generateQuiz(startSettings);
        setQuiz(generated);

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
        if (answer === problem.answer) {
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

    function next() {
        if (settings.infinite) {
            setRound(r => r + 1);
            setAnswers([]);
            setQuiz(generateQuiz(settings));
            setPhase("guessing");
            return;
        }

        if (round + 1 >= quiz.problems.length) {
            setPhase("finished");
            return;
        }

        setRound(r => r + 1);
        setAnswers([]);
        setPhase("guessing");
    }

    function skip() {
        setResults(p => [...p, false]);
        setPhase("reveal");
    }

    function returnToSetup() {
        setPhase("setup");
    }

    return {
        phase, quiz, problem, round, score, answers, results, settings, dailyStats,
        start, submitGuess, skip, next, returnToSetup
    };
}
