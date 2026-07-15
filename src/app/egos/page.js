import styles from "./egos.module.css";
import EgosPage from "./EgosPage";
import { fetchData } from "../components/DataFetcherServer";
import EgoIcon from "../components/icons/EgoIcon";
import NoPrefetchLink from "../components/NoPrefetchLink";
import JsonLd from "../lib/jsonLd";

export function generateMetadata() {
    return {
        title: "E.G.Os",
        description: "Browse all E.G.Os in Limbus Company with advanced search, filters, and comparison tools.",
        alternates: {
            canonical: "/egos"
        }
    };
}

export default async function Page() {
    const egos = await fetchData("egos_mini");

    const initEgos =
        <div className={styles.egosIconGrid}>
            {Object.entries(egos)
                .sort(([aid, ao], [bid, bo]) => ao.sinnerId === bo.sinnerId ? bid.localeCompare(aid) : ao.sinnerId - bo.sinnerId)
                .map(([id, ego]) => <div key={id}>
                    <NoPrefetchLink href={`/egos/${id}`}>
                        <div className={styles.clickableEgo}>
                            <EgoIcon ego={ego} type={"awaken"} displayName={true} displayRarity={true} />
                        </div>
                    </NoPrefetchLink>
                </div>)}
        </div>
        
    return <>
        <JsonLd data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "E.G.Os",
            "url": "https://limbus.eldritchtools.com/egos",
            "isPartOf": {
                "@id": "https://limbus.eldritchtools.com/#website"
            }
        }} />
        <EgosPage initEgos={initEgos} />
    </>;
}
