import EncountersPage from "./EncountersPage";
import { encounterCategoryLabels } from "../lib/encounters";
import { getEncountersForMetadata } from "../lib/metadataHelper";

export async function generateMetadata({ searchParams }) {
    const { category, encounter } = await searchParams;

    let title = "Encounters";
    if (category && encounter) {
        const encounters = await getEncountersForMetadata();
        if (category in encounters && encounter in encounters[category])
            title = `${encounterCategoryLabels[category]}: ${encounters[category][encounter]}`;
    }

    return {
        title: title,
        description: "View details or relevant builds on various encounters.",
        alternates: {
            canonical: "/encounters"
        }
    };
}

export default function Page() {
    return <EncountersPage />;
}
