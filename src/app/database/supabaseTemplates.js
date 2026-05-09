import { getSupabase } from "./connection";

export function convertParams(params, paramsMapping) {
    return Object.entries(paramsMapping).reduce((acc, [s, t]) => {
        if (s in params) acc[t] = params[s];
        return acc;
    }, {});
}

export function paginateParams(params, page, pageSize) {
    params.p_offset = (page - 1) * pageSize;
    params.p_limit = pageSize;
    return params;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function defaultShouldRetry(error) {
    if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        error?.message?.includes("fetch")
    ) {
        return true;
    }

    // HTTP / PostgREST transient errors
    const retryableStatusCodes = [
        408, // timeout
        409, // conflict
        425, // too early
        429, // rate limit
        500,
        502,
        503,
        504,
    ];

    if (retryableStatusCodes.includes(error?.status)) {
        return true;
    }

    return false;
}

export async function withRetry(fn, options = {}) {
    const {
        retries = 3,
        baseDelayMs = 500,
        maxDelayMs = 10_000,
        retry = defaultShouldRetry,
        onRetry,
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            const shouldRetry = retry(error, attempt);
            const isLastAttempt = attempt === retries;

            if (!shouldRetry || isLastAttempt) {
                throw error;
            }

            // Exponential backoff + jitter
            const exponentialDelay = Math.min(
                baseDelayMs * 2 ** attempt,
                maxDelayMs
            );

            const jitter = Math.floor(Math.random() * 250);

            const delay = exponentialDelay + jitter;

            onRetry?.(error, attempt + 1, delay);

            await sleep(delay);
        }
    }

    throw lastError;
}

export async function callRPC(name, params) {
    return withRetry(async () => {
        const { data, error } = await getSupabase().rpc(name, params);

        if (error) throw error;
        return data;
    });
}

export async function deleteObject(table, id) {
    return withRetry(async () => {
        const { error } = await getSupabase().from(table).delete().eq("id", id);

        if (error) throw error;
        return { deleted: true };
    });
}

export async function pinComment(table, id, commentId) {
    return withRetry(async () => {
        const { error } = await getSupabase().from(table).update({ pinned_comment_id: commentId }).eq('id', id);

        if (error) {
            console.error('Error pinning comment:', error);
            throw error;
        }

        return true;
    });
}

export async function unpinComment(table, id) {
    return withRetry(async () => {
        const { error } = await getSupabase().from(table).update({ pinned_comment_id: null }).eq('id', id)

        if (error) {
            console.error('Error unpinning comment:', error);
            throw error;
        }

        return true;
    });
}