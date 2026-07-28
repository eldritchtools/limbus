import CollectionPage from "./CollectionPage";

import JsonLd, { getArticleSchema } from "@/app/lib/jsonLd";
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

    const name = data.title ?? "Collection";
    const desc = cleanMetadataDescription(data.body);
    const path = `/collections/${id}`;

    return {
        title: name,
        description: desc,
        alternates: {
            canonical: path
        },
        robots: {
            index: false,
            follow: true
        },
        openGraph: {
            title: name,
            description: desc,
            url: path,
            type: "website",
        },

        twitter: {
            card: "summary",
            title: name,
            description: desc
        }
    };
}

const schema = async id => {
    const { status, data } = await getCollectionForMetadata(id);

    let schemaData = {
        targetType: "collections",
        targetId: id
    };

    if (status === "not_found") {
        schemaData.title = "Not found";
    } else if (status === "error") {
        schemaData.title = "Collection";
        schemaData.description = "Temporary issue loading content.";
    } else {
        schemaData.title = data.title ?? "Collection";
        if (data.username) schemaData.username = data.username;
        schemaData.description = cleanMetadataDescription(data.body);
        schemaData.published_at = data.published_at ?? data.created_at;
        schemaData.updated_at = data.updated_at;
    }

    return {
        "@context": "https://schema.org",
        "@graph": [
            getArticleSchema(schemaData)
        ]
    }
};

export default async function Page({ params }) {
    const { id } = await params;
    const schemaData = await schema(id);

    return <>
        <JsonLd data={schemaData} />
        <CollectionPage id={id} />
    </>;
}
