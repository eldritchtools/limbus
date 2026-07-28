import CollectionsPage from "./CollectionsPage";
import JsonLd from "../lib/jsonLd";

export function generateMetadata() {
    const name = "Collections";
    const desc = "Browse community collections of team builds and Mirror Dungeon plans in Limbus Company.";
    const path = "/collections";

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
    "name": "Collections",
    "url": "https://limbus.eldritchtools.com/collections",
    "isPartOf": {
        "@id": "https://limbus.eldritchtools.com/#website"
    }
};

export default function Page() {
    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "0.5rem" }}>
        <JsonLd data={schema} />

        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Collections</h1>
        <p style={{ margin: 0 }}>Browse collections organizing related builds and Mirror Dungeon plans. </p>
        <p className="sub-text" style={{ margin: 0 }}>Some collections accept community submissions, allowing owners to review and curate contributions from other users.</p>
        <CollectionsPage />
    </div>;
}
