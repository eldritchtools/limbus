import { getCached } from "./dbCache";
import { callRPC } from "./supabaseTemplates";

export async function getBuild(id) {
    const loader = () => callRPC("get_build_v7", { p_build_id: id, p_for_edit: false })

    return getCached(`build:${id}`, loader);
}