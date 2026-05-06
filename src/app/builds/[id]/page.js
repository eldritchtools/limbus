import BuildPage from "./BuildPage";

import JsonLd, { getArticleSchema } from "@/app/lib/jsonLd";
import { cleanMetadataDescription, getBuildForMetadata } from "@/app/lib/metadataHelper";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const { status, data } = await getBuildForMetadata(id);

    if (status === "not_found") {
        return {
            title: "Not found",
            robots: { index: false },
        };
    }

    if (status === "error") {
        return {
            title: "Team Build",
            description: "Temporary issue loading title.",
            alternates: {
                canonical: `/builds/${id}`
            }
        };
    }

    return {
        title: data.title ?? "Team Build",
        description: cleanMetadataDescription(data.body),
        alternates: {
            canonical: `/builds/${id}`
        }
    };
}

const schema = async id => {
    const { status, data } = await getBuildForMetadata(id);

    let schemaData = {
        targetType: "builds",
        targetId: id
    };

    if (status === "not_found") {
        schemaData.title = "Not found";
    } else if (status === "error") {
        schemaData.title = "Team Build";
        schemaData.description = "Temporary issue loading content.";
    } else {
        schemaData.title = data.title ?? "Team Build";
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
        <BuildPage id={id} />
    </>;
}
