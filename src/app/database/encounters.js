import { getSupabase } from "./connection";
import { callRPC, paginateParams, withRetry } from "./supabaseTemplates";

const clearRecordsPageSize = 50;
const cache = {};

export async function fetchEncounter(id) {
    if (id in cache) return cache[id];

    const result = await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from("encounters")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) throw error;
        return data;
    });

    cache[id] = result;
    return result;
}

export async function fetchClearRecords({ encounterId, difficulty, page, pageSize }) {
    const params = { p_encounter_id: encounterId };
    if (difficulty) params.p_difficulty = difficulty;

    return callRPC("get_encounter_clear_records", paginateParams(params, page, pageSize ?? clearRecordsPageSize));
}

export async function fetchUserClearRecords({ encounterId, userId, difficulty }) {
    const params = { p_encounter_id: encounterId, p_user_id: userId };
    if (difficulty) params.p_difficulty = difficulty;

    return callRPC("get_encounter_clear_records", params);
}

export async function createClearRecord(encounterId, difficulty, turnCount, teamData, videoUrl, notes, imageIds) {
    return callRPC("create_encounter_clear_record",
        {
            p_encounter_id: encounterId,
            p_difficulty: difficulty,
            p_turn_count: turnCount,
            p_team_data: teamData,
            p_video_url: videoUrl,
            p_notes: notes,
            p_image_ids: imageIds
        }
    );
}

export async function updateClearRecord(recordId, difficulty, turnCount, teamData, videoUrl, notes, imageIds) {
    console.log({
            p_id: recordId,
            p_difficulty: difficulty,
            p_turn_count: turnCount,
            p_team_data: teamData,
            p_video_url: videoUrl,
            p_notes: notes,
            p_image_ids: imageIds
        })
    return callRPC("update_encounter_clear_record",
        {
            p_id: recordId,
            p_difficulty: difficulty,
            p_turn_count: turnCount,
            p_team_data: teamData,
            p_video_url: videoUrl,
            p_notes: notes,
            p_image_ids: imageIds
        }
    );
}

export async function deleteClearRecord(recordId) {
    return callRPC("delete_encounter_clear_record", { p_id: recordId });
}