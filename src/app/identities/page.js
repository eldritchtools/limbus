import IdentitiesPage from "./IdentitiesPage";
import { fetchData } from "../components/DataFetcherServer";
import JsonLd from "../lib/jsonLd";

export function generateMetadata() {
    const name = "Identities";
    const desc = "Browse all Identities in Limbus Company with advanced search, filters, and comparison tools.";
    const path = "/identities";

    return {
        title: name,
        description: desc,
        alternates: {
            canonical: path
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

const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Identities",
    "url": "https://limbus.eldritchtools.com/identities",
    "isPartOf": {
        "@id": "https://limbus.eldritchtools.com/#website"
    }
};


export default async function Page() {
    const identities = await fetchData("identities");
    const minifiedIdentities = Object.entries(identities)
        .map(([id, data]) => {
            const { name, rank, sinnerId, skillKeywordList, tags, skillTypes, defenseSkillTypes } = data;
            return [id, { id, name, rank, sinnerId, skillKeywordList, tags, skillTypes, defenseSkillTypes }]
        })
        .sort(([aid, ao], [bid, bo]) => ao.sinnerId === bo.sinnerId ? bid.localeCompare(aid) : ao.sinnerId - bo.sinnerId)

    return <div style={{ display: "flex", flexDirection: "column", maxHeight: "100%", width: "100%", gap: "1rem", alignItems: "center" }}>
        <JsonLd data={schema} />
        <h2 style={{ margin: 0 }}>Identities</h2>
        <p style={{ margin: 0 }}>
            Browse through all available Identities using search and a comprehensive set of filters.
        </p>
        <p className="sub-text" style={{ margin: 0 }}>
            Use Compare Mode to view multiple Identities side by side. Basic compares the complete details of selected Identities, while Advanced compares specific sections across all filtered Identities, such as Support Passives, and provides more comprehensive filters and sorting.
        </p>
        <IdentitiesPage initIdentities={minifiedIdentities} />
    </div>;
}
