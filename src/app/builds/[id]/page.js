import BuildPage from "./BuildPage";

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

export default function Page({ params }) {
    return <BuildPage params={params} />
}
