import BuildsPage from "./BuildsPage";
import JsonLd from "../lib/jsonLd";

export function generateMetadata() {
    return {
        title: "Team Builds",
        description: "Browse and discover team builds shared by the Limbus Company community.",
        alternates: {
            canonical: "/builds"
        }
    };
}

const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Team Builds",
    "url": "https://limbus.eldritchtools.com/builds",
    "isPartOf": {
        "@id": "https://limbus.eldritchtools.com/#website"
    }
};


export default function Page() {
    return <>
        <JsonLd data={schema} />
        <BuildsPage />
    </>;
}
