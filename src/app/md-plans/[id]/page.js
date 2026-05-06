import MdPlanPage from "./MdPlanPage";

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

export default function Page({ params }) {
    return <MdPlanPage params={params} />;
}
