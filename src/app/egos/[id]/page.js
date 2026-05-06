import EgoPage from "./EgoPage";

import { getEgosForMetadata } from "@/app/lib/metadataHelper";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const ego = (await getEgosForMetadata())[id];

    if (!ego) {
        return { title: "E.G.O not found" };
    }

    return {
        title: ego ?? "E.G.O",
        description: `Information for the E.G.O ${ego}`,
        alternates: {
            canonical: `/egos/${id}`
        }
    };
}

export default function Page({ params }) {
    return <EgoPage params={params} />;
}
