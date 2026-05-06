import MdPlanPage from "./MdPlanPage";

import JsonLd, { getArticleSchema } from "@/app/lib/jsonLd";
import { cleanMetadataDescription, getMdPlanForMetadata } from "@/app/lib/metadataHelper";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const { status, data } = await getMdPlanForMetadata(id);

    if (status === "not_found") {
        return {
            title: "Not found",
            robots: { index: false },
        };
    }

    if (status === "error") {
        return {
            title: "MD Plan",
            description: "Temporary issue loading title.",
            alternates: {
                canonical: `/md-plans/${id}`
            }
        };
    }

    return {
        title: data.title ?? "MD Plan",
        description: cleanMetadataDescription(data.body),
        alternates: {
            canonical: `/md-plans/${id}`
        }
    };
}

const schema = async id => {
    const { status, data } = await getMdPlanForMetadata(id);

    let schemaData = {
        targetType: "md_plans",
        targetId: id
    };

    if (status === "not_found") {
        schemaData.title = "Not found";
    } else if (status === "error") {
        schemaData.title = "MD Plan";
        schemaData.description = "Temporary issue loading content.";
    } else {
        schemaData.title = data.title ?? "MD Plan";
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
        <MdPlanPage id={id} />
    </>;
}
