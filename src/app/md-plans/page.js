import MdPlansPage from "./MdPlansPage";
import JsonLd from "../lib/jsonLd";

export function generateMetadata() {
    return {
        title: "MD Plans",
        description: "Browse and discover Mirror Dungeon plans shared by the Limbus Company community.",
        alternates: {
            canonical: "/md-plans"
        }
    };
}

const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "MD Plans",
    "url": "https://limbus.eldritchtools.com/md-plans",
    "isPartOf": {
        "@id": "https://limbus.eldritchtools.com/#website"
    }
};

export default function Page() {
    return <>
        <JsonLd data={schema} />
        <MdPlansPage />
    </>;
}
