import CollectionsPage from "./CollectionsPage";
import JsonLd from "../lib/jsonLd";

export function generateMetadata() {
    return {
        title: "Collections",
        description: "Browse community collections of team builds and Mirror Dungeon plans in Limbus Company.",
        alternates: {
            canonical: "/collections"
        }
    };
}

const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Collections",
    "url": "https://limbus.eldritchtools.com/collections",
    "isPartOf": {
        "@id": "https://limbus.eldritchtools.com/#website"
    }
};

export default function Page() {
    return <>
        <JsonLd data={schema} />
        <CollectionsPage />
    </>;
}
