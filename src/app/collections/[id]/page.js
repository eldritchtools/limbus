import CollectionPage from "./CollectionPage";

import { cleanMetadataDescription, getCollectionForMetadata } from "@/app/lib/metadataHelper";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const { status, data } = await getCollectionForMetadata(id);

    if (status === "not_found") {
        return {
            title: "Not found",
            robots: { index: false },
        };
    }

    if (status === "error") {
        return {
            title: "Collection",
            description: "Temporary issue loading title.",
            alternates: {
                canonical: `/collections/${id}`
            }
        };
    }

    return {
        title: data.title ?? "Collection",
        description: cleanMetadataDescription(data.body),
        alternates: {
            canonical: `/collections/${id}`
        }
    };
}

export default function Page({ params }) {
    return <CollectionPage params={params} />;
}
