import { getSupabase } from "./connection";
import { callRPC, withRetry } from "./supabaseTemplates";

const defaultDailyStats = {
    last_completed_date: null,
    last_completed_correct: null,
    quizzes_played: 0,
    quizzes_correct: 0
}

export function constructDefaultDailyStats(id) {
    return { ...defaultDailyStats, quiz_id: id }
}

export async function getDailyQuiz(id, date) {
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("daily_quizzes")
            .select("data")
            .eq("id", id)
            .eq("date", date)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            throw error;
        }

        return data.data;
    });
}

export async function saveDailyQuiz(id, date, quizData) {
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("daily_quizzes")
            .insert({ id: id, date: date, data: quizData })

        if (error) throw error;
        return data;
    });
}

export async function getDailyQuizStats(id) {
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("user_daily_quiz_stats")
            .select("*")
            .eq("quiz_id", id)
            .maybeSingle();

        if (error) throw error;
        return data;
    });
}

export async function updateDailyQuizStats(id, date, correct) {
    return callRPC("submit_daily_result", { p_quiz_id: id, p_date: date, p_correct: correct });
}
