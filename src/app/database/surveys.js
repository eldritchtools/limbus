import { getSupabase } from "./connection";
import { callRPC, withRetry } from "./supabaseTemplates";

export async function fetchSurveyResponse(surveyId) {
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("survey_responses")
            .select("answers, updated_at")
            .eq("survey_id", surveyId)
            .maybeSingle()

        if (error) throw error;
        return data;
    });
}

export async function fetchSurveyAggregates(surveyId) {
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("survey_aggregates")
            .select("question_index, answer, count")
            .eq("survey_id", surveyId);

        if (error) throw error;
        return data;
    });
}

export async function submitSurveyResponse(surveyId, answers) {
    return callRPC("submit_survey_response", { p_survey_id: surveyId, p_answers: answers });
}

export async function fetchSurveyResponseCount(surveyId) {
    return callRPC("get_survey_response_count", { p_survey_id: surveyId });
}