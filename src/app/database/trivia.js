import { callRPC } from "./supabaseTemplates";

export async function getTriviaQuestions(mode = "curated", limit = 10) {
    return callRPC("get_random_trivia_questions", { p_mode: mode, p_limit: limit })
}

export async function searchTriviaQuestions(query, limit = 10) {
    return callRPC("search_trivia_questions", { p_query: query, p_limit: limit })
}

export async function submitTriviaQuestion({ question, answer, answerType = "short_answer", otherAnswers = [], explanation = null }) {
    return callRPC("submit_trivia_question", {
        p_question: question,
        p_answer: answer,
        p_answer_type: answerType,
        p_other_answers: otherAnswers,
        p_explanation: explanation || null
    })
}

export async function submitTriviaReport({ questionId, reason, details = null }) {
    return callRPC("submit_trivia_report", {
        p_question_id: questionId,
        p_reason: reason,
        p_details: details || null
    });
}

export async function getPendingTriviaQuestions(limit = 10) {
    return callRPC("get_pending_trivia_questions", { p_limit: limit });
}

export async function moderateTriviaQuestion(questionId, action) {
    return callRPC("moderate_trivia_question", { p_question_id: questionId, p_action: action });
}

export async function getTriviaReports(limit = 10) {
    return callRPC("get_trivia_reports", { p_limit: limit });
}

export async function resolveTriviaReport(reportId) {
    return callRPC("resolve_trivia_report", { p_report_id: reportId });
}

export async function updateTriviaQuestion({ id, question, answer, answerType, otherAnswers = [], explanation = null }) {
    return callRPC("update_trivia_question_v2", {
        p_question_id: id,
        p_question: question,
        p_answer: answer,
        p_answer_type: answerType,
        p_other_answers: otherAnswers,
        p_explanation: explanation || null
    });
}

export async function getTriviaQuestionCounts() {
    return callRPC("get_trivia_question_counts");
}

export async function getMyPendingTriviaQuestions() {
    return callRPC("get_my_pending_trivia_questions");
}

export async function deleteTriviaQuestion(questionId) {
    return callRPC("delete_trivia_question", { p_question_id: questionId })
}