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
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Identities</h1>
        <p style={{ margin: 0 }}>
            Browse through all available Identities using search and a comprehensive set of filters.
        </p>
        <p className="sub-text" style={{ margin: 0, textAlign: "center", maxWidth: "1280px" }}>
            Browse through the full list of Identities. Search or filter identities by statuses, factions, tags, or seasons. Display types let you choose how much information is shown for each identity.
            <br /><br />
            Compare modes provide more detailed ways to examine multiple Identities at once. <strong>Basic Compare Mode</strong> places the full details of selected Identities side by side, making it easier to compare their stats, skills, passives, and other information.
            <br /><br />
            <strong>Advanced Compare Mode</strong> turns the catalogue into a more powerful search and analysis tool. Identities can be filtered and sorted by their stats, like HP, speed, and resistances. Skills and passives can also be searched and filtered based on properties such as power, coin count, damage type, and the text from their descriptions. This makes it possible to find Identities based on specific characteristics rather than only by name or the existing filters.
        </p>
        <IdentitiesPage initIdentities={minifiedIdentities} />
    </div>;
}
