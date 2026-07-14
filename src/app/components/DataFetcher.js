import { DATA_ROOT, PUBLIC_ROOT } from "../paths";

export function preprocess_fetched_data(path, data) {
    if (["egos_mini", "egos", "identities_mini", "identities", "gifts", "statuses", "md_choice_events"].includes(path)) {
        return Object.entries(data).reduce((acc, [k, v]) => {
            acc[k] = { id: k, ...v }
            return acc;
        }, {});
    } else {
        return data;
    }
}

export async function fetchData(path) {
    const res = await fetch(`${DATA_ROOT}/${path}.json`, { next: { revalidate: 60 } });
    const json = await res.json();
    const data = json.error ? {} : preprocess_fetched_data(path, json);

    return data;
}

export async function clientFetchData(path) {
    const res = await fetch(`${DATA_ROOT}/${path}.json`);
    const json = await res.json();
    const data = json.error ? {} : preprocess_fetched_data(path, json);

    return data;
}

export async function fetchMeta() {
    if (process.env.ENABLE_LOCAL_DATA)
        return { datetime: new Date().toISOString() };
    else
        return (await fetch(`${PUBLIC_ROOT}/meta.json`, { next: { revalidate: 60 } })).json();
}