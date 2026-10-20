import { normalizeString } from "../lib/filter";

export const defaultSettings = {
    mode: "standard",
    rounds: 10,
    curated: false
};

export const defaultQuestion = {
    answerType: "short_answer",
    question: "",
    answer: "",
    otherAnswers: [],
    explanation: ""
};

export function remapQuestion(question) {
    return {
        id: question.id ?? question.question_id,
        answerType: question.answer_type,
        question: question.question ?? question.question_text,
        answer: question.answer,
        otherAnswers: question.other_answers,
        explanation: question.explanation,
        status: question.status ?? question.question_status,
        username: question.username,
        reportId: question.report_id,
        reporter: question.reporter,
        reason: question.reason,
        details: question.details,
    }
}

function levenshteinDistance(a, b) {
    if (a.length < b.length) {
        [a, b] = [b, a];
    }

    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

    for (let i = 1; i <= a.length; i++) {
        const current = [i];

        for (let j = 1; j <= b.length; j++) {
            current[j] = Math.min(
                current[j - 1] + 1,
                previous[j] + 1,
                previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }

        previous = current;
    }

    return previous[b.length];
}

function getMaxEditDistance(answer) {
    if (answer.length <= 4) return 0;
    if (answer.length <= 8) return 1;
    return 2;
}

export function checkAnswer(answer, question) {
    if (question.answerType === "multiple_choice") return answer === question.answer;

    const submitted = normalizeString(answer);
    if (!submitted) return false;

    const acceptedAnswers = [question.answer, ...(question.otherAnswers ?? [])].map(normalizeString).filter(Boolean);
    if (acceptedAnswers.some(answer => answer === submitted)) return true;

    if (/^\d+$/.test(submitted)) return false;

    return acceptedAnswers.some(answer => {
        if (/^\d+$/.test(answer)) return false;

        if (Math.abs(answer.length - submitted.length) > getMaxEditDistance(answer)) return false;
        return levenshteinDistance(submitted, answer) <= getMaxEditDistance(answer);
    });
}

export const TRIVIA_REPORT_REASONS = {
    "incorrect_answer": "Incorrect Answer",
    "ambiguous": "Ambiguous",
    "inappropriate": "Inappropriate",
    "duplicate": "Duplicate",
    "outdated": "Outdated",
    "other": "Other"
};