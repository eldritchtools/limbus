import EncountersPage from "./EncountersPage";
import { encounterCategoryLabels } from "../lib/encounters";
import JsonLd, { getWebPageSchema } from "../lib/jsonLd";
import { getEncountersForMetadata } from "../lib/metadataHelper";

export async function generateMetadata({ searchParams }) {
    const { category, encounter } = await searchParams;

    let title = "Encounters";
    let description = "View details for encounters in Limbus Company, including related team builds and community discussion.";
    if (category && encounter) {
        const encounters = await getEncountersForMetadata();
        if (category in encounters && encounter in encounters[category]) {
            title = `${encounterCategoryLabels[category]}: ${encounters[category][encounter]}`;
            description = `Details for ${encounterCategoryLabels[category]}: ${encounters[category][encounter]}`;
        }
    }

    return {
        title: title,
        description: description,
        alternates: {
            canonical: "/encounters"
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

// Encounter loaded client-side, dynamic jsonld supposedly not recommended

// const schema = async (searchParams) => {
//     const { category, encounter } = searchParams;

//     let title = "Encounters";
//     let description = "View details or relevant builds on various encounters.";
//     let url = "https://limbus.eldritchtools.com/encounters";

//     if (category && encounter) {
//         const encounters = await getEncountersForMetadata();

//         if (category in encounters && encounter in encounters[category]) {
//             title = `${encounterCategoryLabels[category]}: ${encounters[category][encounter]}`;
//             description = `Details for ${encounters[category][encounter]}`;
//             url = `https://limbus.eldritchtools.com/encounters?category=${category}&encounter=${encounter}`;
//         }
//     }

//     return {
//         "@context": "https://schema.org",
//         "@graph": [
//             getWebPageSchema({
//                 title,
//                 description,
//                 url
//             })
//         ]
//     };
// };

// export default async function Page({ searchParams }) {
// const schemaData = await schema(searchParams);
export default function Page() {

    return <>
        <JsonLd data={schema} />
        <EncountersPage />
    </>;
}