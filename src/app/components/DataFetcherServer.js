import { DATA_ROOT, PUBLIC_ROOT } from "../paths";
import { preprocess_fetched_data } from "./DataFetcher";


export async function fetchData(path) {
    // increase revalidate to 86400 if incoming bandwidth ends up being costly
    const res = await fetch(`${DATA_ROOT}/${path}.json`, { next: { tags: ["cdn-data"], revalidate: 60 } });
    const json = await res.json();
    const data = json.error ? {} : preprocess_fetched_data(path, json);

    return data;
}

export async function fetchMeta() {
    if (process.env.NODE_ENV === "development")
        return { datetime: new Date().toISOString() };
    else {
        return (await fetch(`${PUBLIC_ROOT}/meta.json`, { next: { revalidate: 60 } })).json();
    }
}