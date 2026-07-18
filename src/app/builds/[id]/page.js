import BuildPage from "./BuildPage";
import { BuildPageLocalWrapper } from "./BuildPageComponents";

import { getBuild } from "@/app/database/serverSafeDb";
import { isUuid } from "@/app/database/uuidCheck";
import JsonLd, { getArticleSchema } from "@/app/lib/jsonLd";
import { cleanMetadataDescription } from "@/app/lib/metadataHelper";

const MIN_INDEXABLE_DESCRIPTION = 150;

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

    // if (status === "error") {
    //     return {
    //         title: "Team Build",
    //         description: "Temporary issue loading title.",
    //         alternates: {
    //             canonical: `/builds/${id}`
    //         }
    //     };
    // }

    return {
        title: data.title ?? "Team Build",
        description: cleanMetadataDescription(data.body),
        alternates: {
            canonical: `/builds/${id}`
        },
        robots: {
            index: description.length >= MIN_INDEXABLE_DESCRIPTION,
            follow: true,
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
