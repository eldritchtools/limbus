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


export default async function Page({ searchParams }) {
    const { compare } = await searchParams;
    const identities = await fetchData("identities");
    const minifiedIdentities = Object.entries(identities)
        .map(([id, data]) => {
            if(compare) return [id, data];
            const { name, rank, sinnerId, skillKeywordList, tags, skillTypes, defenseSkillTypes } = data;
            return [id, { id, name, rank, sinnerId, skillKeywordList, tags, skillTypes, defenseSkillTypes }];
        })
        .sort(([aid, ao], [bid, bo]) => ao.sinnerId === bo.sinnerId ? bid.localeCompare(aid) : ao.sinnerId - bo.sinnerId)

    return <div style={{ display: "flex", flexDirection: "column", maxHeight: "100%", width: "100%", gap: "1rem", alignItems: "center" }}>
        <JsonLd data={schema} />
        <IdentitiesPage initIdentities={minifiedIdentities} compare={compare} />
    </div>;
}
