import { getSupabase } from "./connection";
import { callRPC } from "./supabaseTemplates";

export const defaultReviewsPageSize = 20;

export async function submitReview({ itemType, itemId, criteria1, criteria2, criteria3, criteria4, criteria5, reviewText }) {
    return callRPC("submit_review", {
        p_item_type: itemType,
        p_item_id: itemId,

        p_criteria_1: criteria1,
        p_criteria_2: criteria2,
        p_criteria_3: criteria3,
        p_criteria_4: criteria4,
        p_criteria_5: criteria5,

        p_review_text: reviewText ?? null,
    });
}

export async function deleteReview({ itemType, itemId }) {
    return callRPC("delete_review", {
        p_item_type: itemType,
        p_item_id: itemId,
    });
}

export function getReviewScores(item) {
    if (!item) return null;

    return [
        item.criteria_1,
        item.criteria_2,
        item.criteria_3,
        item.criteria_4,
        item.criteria_5
    ];
}

export function getOverallScore(scores) {
    return scores.reduce((acc, score) => acc + score, 0) / scores.length;
}

export async function getUserReview({ userId, itemType, itemId }) {
    const { data, error } = await getSupabase()
        .from("reviews")
        .select("*")
        .eq("user_id", userId)
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;

    return data;
}

export async function getUserReviewsByType({ userId, itemType }) {
    const { data, error } = await getSupabase()
        .from("reviews")
        .select("*")
        .eq("user_id", userId)
        .eq("item_type", itemType)

    if (error) throw error;

    return Object.fromEntries(data.map(item => {
        const scores = getReviewScores(item);
        return [item.item_id, { overallRating: getOverallScore(scores), rating: scores, review_text: item.review_text }]
    }));
}

export async function getItemReviews({ itemType, itemId, page = 1, pageSize = defaultReviewsPageSize }) {
    const offset = (page - 1) * pageSize;

    const { data, error } = await getSupabase()
        .from("reviews")
        .select(`id, user_id, criteria_1, criteria_2, criteria_3, criteria_4, criteria_5, review_text, updated_at, user:users ( username )`)
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .not("review_text", "is", null)
        .neq("review_text", "")
        .order("updated_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return data;
}

function aggregateData(item) {
    if (!item || item.vote_count === 0) return Array.from({ length: 5 }, () => 0);

    return [
        item.criteria_1_sum / item.vote_count,
        item.criteria_2_sum / item.vote_count,
        item.criteria_3_sum / item.vote_count,
        item.criteria_4_sum / item.vote_count,
        item.criteria_5_sum / item.vote_count
    ];
}

export async function getItemAggregates({ itemType, itemId }) {
    const { data, error } = await getSupabase()
        .from("item_rating_aggregates")
        .select("*")
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return { votes: data.vote_count, rating: aggregateData(data) };
}

export async function getAggregatesByType({ itemType }) {
    const { data, error } = await getSupabase()
        .from("item_rating_aggregates")
        .select("*")
        .eq("item_type", itemType)

    if (error) throw error;

    return Object.fromEntries(data.map(item => {
        const scores = aggregateData(item);
        return [item.item_id, { votes: item.vote_count, overallRating: getOverallScore(scores), rating: scores }]
    }));
}
