import BuildsPage from "./BuildsPage";
import JsonLd from "../lib/jsonLd";

export function generateMetadata() {
    return {
        title: "Team Builds",
        description: "Browse team builds shared by users.",
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
