import EgoPage from "./EgoPage";

import JsonLd from "@/app/lib/jsonLd";
import { getEgosForMetadata } from "@/app/lib/metadataHelper";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const ego = (await getEgosForMetadata())[String(id)];

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

const schema = async id => {
    const ego = (await getEgosForMetadata())[String(id)] ?? "Temporary missing name";

    return {
        "@context": "https://schema.org",
        "@type": "Thing",
        "@id": `https://limbus.eldritchtools.com/egos/${id}`,
        "name": ego,
        "url": `https://limbus.eldritchtools.com/egos/${id}`,
        "isPartOf": {
            "@id": "https://limbus.eldritchtools.com/#website"
        }
    }
};

export default async function Page({ params }) {
    const { id } = await params;
    const schemaData = await schema(id);

    return <>
        <JsonLd data={schemaData} />
        <EgoPage params={params} />
    </>;
}
