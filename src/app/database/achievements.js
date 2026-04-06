import { getSupabase } from "./connection";

async function getAchievementsProgress(user) {
    const { data, error } = await getSupabase()
        .from("achievement_progress")
        .select("*")
        .eq('user_id', user.id)
        .maybeSingle()

    if (error) throw error;
    return data;
}

async function updateAchievementsProgress(user, userData) {
    const { data, error } = await getSupabase()
        .from("achievement_progress")
        .upsert({
            user_id: user.id,
            season_key: userData.season,
            progress: userData.tracking,
            additional_points: userData.additionalPoints,
            updated_at: new Date()
        })

    if (error) throw error;
    return data;
}

export { getAchievementsProgress, updateAchievementsProgress };