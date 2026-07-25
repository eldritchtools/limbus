import IdentitiesPage from "./IdentitiesPage";
import { fetchData } from "../components/DataFetcherServer";
import JsonLd from "../lib/jsonLd";

export function generateMetadata() {
    return {
        title: "Identities",
        description: "Browse all Identities in Limbus Company with advanced search, filters, and comparison tools.",
        alternates: {
            canonical: "/identities"
        }
    };
}

export default async function Page() {
    const identities = await fetchData("identities");
    const minifiedIdentities = Object.entries(identities)
        .map(([id, data]) => {
            const { name, rank, sinnerId, skillKeywordList, tags, skillTypes, defenseSkillTypes } = data;
            return [id, { id, name, rank, sinnerId, skillKeywordList, tags, skillTypes, defenseSkillTypes }]
        })
        .sort(([aid, ao], [bid, bo]) => ao.sinnerId === bo.sinnerId ? bid.localeCompare(aid) : ao.sinnerId - bo.sinnerId)

    return <>
        <JsonLd data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Identities",
            "url": "https://limbus.eldritchtools.com/identities",
            "isPartOf": {
                "@id": "https://limbus.eldritchtools.com/#website"
            }
        }} />
        <IdentitiesPage initIdentities={minifiedIdentities} />
    </>;
}
