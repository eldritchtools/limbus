import IdentityPage from "./IdentityPage";

import JsonLd from "@/app/lib/jsonLd";
import { getIdentitiesForMetadata } from "@/app/lib/metadataHelper";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const identity = (await getIdentitiesForMetadata())[String(id)];

    if (!identity) {
        return { title: "Identity not found" };
    }

    return {
        title: identity ?? "Identity",
        description: `Identity details for ${identity} in Limbus Company, including stats, effects, notes, and usage information.`,
        alternates: {
            canonical: `/identities/${id}`
        }
    };
}

const schema = async id => {
    const identity = (await getIdentitiesForMetadata())[String(id)] ?? "Temporary missing name";

    return {
        "@context": "https://schema.org",
        "@type": "Thing",
        "@id": `https://limbus.eldritchtools.com/identities/${id}`,
        "name": identity,
        "url": `https://limbus.eldritchtools.com/identities/${id}`,
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
        <IdentityPage params={params} />
    </>;
}
