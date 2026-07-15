import styles from "./identities.module.css";
import IdentitiesPage from "./IdentitiesPage";
import { fetchData } from "../components/DataFetcherServer";
import IdentityIcon from "../components/icons/IdentityIcon";
import NoPrefetchLink from "../components/NoPrefetchLink";
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
    const identities = await fetchData("identities_mini");

    const initIdentities =
        <div className={styles.identitiesIconGrid}>
            {Object.entries(identities)
                .sort(([aid, ao], [bid, bo]) => ao.sinnerId === bo.sinnerId ? bid.localeCompare(aid) : ao.sinnerId - bo.sinnerId)
                .map(([id, identity]) => <div key={id}>
                    <NoPrefetchLink href={`/identities/${id}`}>
                        <div className={styles.clickableId}>
                            <IdentityIcon identity={identity} uptie={4} displayName={true} displayRarity={true} />
                        </div>
                    </NoPrefetchLink>
                </div>)}
        </div>

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
        <IdentitiesPage initIdentities={initIdentities} />
    </>;
}
