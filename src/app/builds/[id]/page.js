import BuildPage from "./BuildPage";
import { BuildPageLocalWrapper } from "./BuildPageComponents";

import { getBuild } from "@/app/database/serverSafeDb";
import { isUuid } from "@/app/database/uuidCheck";
import JsonLd, { getArticleSchema } from "@/app/lib/jsonLd";
import { cleanMetadataDescription } from "@/app/lib/metadataHelper";

export async function generateMetadata({ params }) {
    const { id } = await params;

    let data;
    try {
        data = await getBuild(id);
    } catch (e) {
        return {
            title: "Not found",
            robots: { index: false },
        };
    }

    const name = data.title ?? "Team Build";
    const desc = cleanMetadataDescription(data.body);
    const path = `/builds/${id}`;

    return {
        title: name,
        description: desc,
        alternates: {
            canonical: path
        },
        robots: {
            index: data.indexable ?? false,
            follow: true,
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

const schema = (id, data) => {
    let schemaData = {
        targetType: "builds",
        targetId: id
    };

    if (!data) {
        schemaData.title = "Not found";
        // } else if (status === "error") {
        //     schemaData.title = "Team Build";
        //     schemaData.description = "Temporary issue loading content.";
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

    if (isUuid(id)) return <BuildPageLocalWrapper id={id} />

    let build;

    try {
        build = await getBuild(id);
    } catch(e) {
        build = null;
    }

    const schemaData = schema(id, build);

    return <>
        <JsonLd data={schemaData} />
        <BuildPage id={id} build={build} />
    </>;
}
