import { getSupabase } from "./connection";
import { withRetry } from "./supabaseTemplates";

export async function getBuildsForSitemap(page, count) {
    const offset = (page - 1) * count;
    return await withRetry(async () => {
        const { data, error } = await getSupabase()
            .from('builds')
            .select('id, created_at, updated_at')
            .eq('is_published', true)
            .order('created_at', { ascending: true })
            .range(offset, offset + count - 1);

        if (error) throw (error);
        return data;
    });
}

export async function getBuildsCountForSitemap() {
    return await withRetry(async () => {
        const { count, error } = await getSupabase()
            .from('builds')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true);

        if (error) throw (error);
        return count;
    });
}

export async function getCollectionsForSitemap(page, count) {
    return await withRetry(async () => {
        const offset = (page - 1) * count;
        const { data, error } = await getSupabase()
            .from('collections')
            .select('id, created_at, updated_at')
            .eq('is_published', true)
            .order('created_at', { ascending: true })
            .range(offset, offset + count - 1);

        if (error) throw (error);
        return data;
    });
}

export async function getCollectionsCountForSitemap() {
    return await withRetry(async () => {
        const { count, error } = await getSupabase()
            .from('collections')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true);

        if (error) throw (error);
        return count;
    });
}

export async function getMdPlansForSitemap(page, count) {
    return await withRetry(async () => {
        const offset = (page - 1) * count;
        const { data, error } = await getSupabase()
            .from('md_plans')
            .select('id, created_at, updated_at')
            .eq('is_published', true)
            .order('created_at', { ascending: true })
            .range(offset, offset + count - 1);

        if (error) throw (error);
        return data;
    });
}

export async function getMdPlansCountForSitemap() {
    return await withRetry(async () => {
        const { count, error } = await getSupabase()
            .from('md_plans')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true);

        if (error) throw (error);
        return count;
    });
}
