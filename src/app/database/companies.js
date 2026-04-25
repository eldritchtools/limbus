import { getSupabase } from "./connection";
import { callRPC } from "./supabaseTemplates";

async function getCompany(user) {
    const { data, error } = await getSupabase()
        .from("companies")
        .select("*")
        .eq('user_id', user.id)
        .maybeSingle()

    if (error) throw error;
    return data;
}

async function updateCompany(user, userData) {
    const { data, error } = await getSupabase()
        .from("companies")
        .upsert({
            user_id: user.id,
            identities: userData.identities,
            egos: userData.egos,
            updated_at: new Date()
        })

    if (error) throw error;
    return data;
}

async function getCompanyByUsername(username) {
    const result = await callRPC("get_company_by_username", { p_username: username });
    if (result.length === 0) return null;
    return result[0];
}

export { getCompany, updateCompany, getCompanyByUsername };