import { getSupabase } from "./connection";
import { callRPC, convertParams, deleteObject, paginateParams, pinComment, unpinComment, withRetry } from "./supabaseTemplates";
import { contentConfig } from "../lib/contentConfig";

const searchParams = {
    query: "p_query",
    collectionIds: "collection_id_filter",
    userId: "user_id_filter",
    username: "username_exact_filter",
    tags: "tag_filter",
    ignoreBlockDiscovery: "p_ignore_block_discovery",
    published: "p_published",
    sortBy: "p_sort_by",
};

const createParams = {
    collectionId: "p_collection_id",
    title: "p_title",
    body: "p_body",
    shortDesc: "p_short_desc",
    submissionMode: "p_submission_mode",
    published: "p_is_published",
    blockDiscovery: "p_block_discovery",
    items: "p_items",
    tags: "p_tags",
    imageIds: "p_image_ids"
};

export async function searchCollections(params, page = 1, pageSize = null) {
    return callRPC("search_collections_v5", paginateParams(convertParams(params, searchParams), page, pageSize ?? contentConfig.collections.defaultPageSize));
}

export async function getCollection(id) {
    return callRPC("get_collection_v5", { p_collection_id: id })
}

export async function insertCollection(params) {
    return callRPC("create_collection_v3", convertParams(params, createParams));
}

export async function updateCollection(params) {
    await callRPC("update_collection_v3", convertParams(params, createParams));
    return params.collectionId;
}

export async function deleteCollection(collection_id) {
    await callRPC("delete_collection", { p_collection_id: collection_id });
    return { deleted: true };
}

export async function pinCollectionComment(collectionId, commentId) {
    return pinComment("collections", collectionId, commentId);
}

export async function unpinCollectionComment(collectionId) {
    return unpinComment("collections", collectionId);
}

export async function getSavedCollections(user_id, page = 1, pageSize = null) {
    return callRPC("get_saved_collections_v2", paginateParams({ p_user_id: user_id }, page, pageSize ?? contentConfig.collections.defaultPageSize));
}

export async function submitCollectionContribution(user_id, collection_id, target_type, target_id, note, submitter_note) {
    try {
        return await withRetry(async () => {
            const { error } = await getSupabase()
                .from("collection_submissions")
                .insert({
                    collection_id: collection_id,
                    target_type: target_type,
                    target_id: target_id,
                    note: note,
                    submitter_note: submitter_note,
                    submitted_by: user_id
                });

            if (error?.code === "23505") return "You have a pending submission for this item on this collection.";
            if (error) throw error;

            return "Success";
        });
    } catch (err) {
        return "Something went wrong while submitting.";
    };
}

export async function getCollectionSubmissions(id) {
    return callRPC("get_collection_submissions_v3", { p_collection_id: id });
}

export async function approveCollectionSubmission(id, note) {
    return callRPC("approve_collection_submission", { p_submission_id: id, p_note: note });
}

export async function rejectCollectionSubmission(id) {
    return callRPC("reject_collection_submission", { p_submission_id: id });
}

export async function rejectCollectionSubmissionsForTarget(collection_id, target_type, target_id) {
    return callRPC(
        "reject_collection_submissions_for_target",
        { p_collection_id: collection_id, p_target_type: target_type, p_target_id: target_id }
    );
}
