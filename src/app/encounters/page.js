import EncountersPage from "./EncountersPage";
import { encounterCategoryLabels } from "../lib/encounters";
import JsonLd, { getWebPageSchema } from "../lib/jsonLd";
import { getEncounterMetadata } from "../lib/metadataHelper";

export async function generateMetadata({ searchParams }) {
    const { category, encounter } = await searchParams;

    let title = "Encounters";
    let description = "View details for encounters in Limbus Company, including related team builds and community discussion.";
    if (category && encounter) {
        const encounterTitle = await getEncounterMetadata(category, encounter);
        if (encounterTitle) {
            title = `${encounterCategoryLabels[category]}: ${encounterTitle}`;
            description = `Details for ${encounterCategoryLabels[category]}: ${encounterTitle}`;
        }
    }

    return {
        title: title,
        description: description,
        alternates: {
            canonical: "/encounters"
        },
        openGraph: {
            title: title,
            description: description,
            url: "/encounters",
            type: "website",
        },
        twitter: {
            card: "summary",
            title: title,
            description: description
        }
    };
}

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Encounters",
            description: "View details for encounters in Limbus Company, including related team builds and community discussion.",
            url: "https://limbus.eldritchtools.com/encounters"
        })
    ]
};

export default function Page() {

    return <>
        <JsonLd data={schema} />
        <EncountersPage />
    </>;
}