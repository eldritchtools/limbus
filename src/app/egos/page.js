import EgosPage from "./EgosPage";
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

export default function Page() {
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
        <EgosPage />
    </>;
}
