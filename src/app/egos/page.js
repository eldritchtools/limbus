import EgosPage from "./EgosPage";
import { fetchData } from "../components/DataFetcherServer";
import JsonLd from "../lib/jsonLd";

export function generateMetadata() {
    const name = "E.G.Os";
    const desc = "Browse all E.G.Os in Limbus Company with advanced search, filters, and comparison tools.";
    const path = "/egos"
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
    "name": "E.G.Os",
    "url": "https://limbus.eldritchtools.com/egos",
    "isPartOf": {
        "@id": "https://limbus.eldritchtools.com/#website"
    }
}

export default async function Page() {
    const egos = await fetchData("egos");
    const minifiedEgos = Object.entries(egos)
        .map(([id, data]) => {
            const { name, rank, sinnerId, cost, resists, awakeningType, corrosionType, statuses } = data;
            return [id, { id, name, rank, sinnerId, cost, resists, awakeningType, corrosionType, statuses }]
        })
        .sort(([aid, ao], [bid, bo]) => ao.sinnerId === bo.sinnerId ? bid.localeCompare(aid) : ao.sinnerId - bo.sinnerId)


    return <>
        <JsonLd data={schema} />
        <EgosPage initEgos={minifiedEgos} />
    </>;
}
