const { getSupabase } = require("./connection");

export function convertParams(params, paramsMapping) {
    return Object.entries(paramsMapping).reduce((acc, [s, t]) => {
        if(s in params) acc[params[s]] = t;
        return acc;
    }, {});
}

export function paginateParams(params, page, pageSize) {
    params.p_offset = (page - 1) * pageSize;
    params.p_limit = pageSize;
    return params;
}

export async function callRPC(name, params) {
    const { data, error } = await getSupabase().rpc(name, params);

    if (error) throw error;
    return data;
}

export async function deleteObject(table, id) {
    const { error } = await getSupabase().from(table).delete().eq("id", id);

    if (error) throw error;
    return { deleted: true };    
}

export async function pinComment(table, id, commentId) {
    const { error } = await getSupabase().from(table).update({ pinned_comment_id: commentId }).eq('id', id);

    if (error) {
        console.error('Error pinning comment:', error);
        return null;
    }

    return true;
}

export async function unpinComment(table, id) {
    const { error } = await getSupabase().from(table).update({ pinned_comment_id: null }).eq('id', id)

    if (error) {
        console.error('Error unpinning comment:', error);
        return null;
    }

    return true;
}