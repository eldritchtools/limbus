import IdentitiesPage from "./IdentitiesPage";
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

export default function Page() {
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
        <IdentitiesPage />
    </>;
}
