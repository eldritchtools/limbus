import { getSupabase } from "./connection";
import { callRPC, paginateParams } from "./supabaseTemplates";

const DEFAULT_PAGE_SIZE = 20;

export async function getComments(type, id, page = 1) {
    return callRPC(
        "get_target_comments_v1",
        paginateParams({ p_target_id: id, p_target_type: type }, page, DEFAULT_PAGE_SIZE)
    );
}

export async function addComment(type, id, body, parentId = null) {
    const { data, error } = await getSupabase()
        .from("comments")
        .insert([{ target_type: type, target_id: id, body, parent_id: parentId }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateComment(type, id, body) {
    const { data, error } = await getSupabase()
        .from("comments")
        .update({ body })
        .eq("target_type", type)
        .eq("id", id)

    if (error) throw error;
    return data;
}

export async function deleteComment(type, id) {
    const { error } = await getSupabase()
        .from("comments")
        .update({ body: "", deleted: true })
        .eq("target_type", type)
        .eq("id", id);

    if (error) throw error;
}
