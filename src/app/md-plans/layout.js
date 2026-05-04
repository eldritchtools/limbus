import { Suspense } from "react";

import JsonLd from "../lib/jsonLd";

export const metadata = {
    title: "MD Plans | Limbus Company Tools",
    description: "Browse MD Plans"
};

const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "MD Plans",
    "url": "https://limbus.eldritchtools.com/md-plans",
    "isPartOf": {
        "@id": "https://limbus.eldritchtools.com/#website"
    }
};

export default function MdPlansLayout({ children }) {
    return <Suspense fallback={<div>Loading...</div>}>
        <JsonLd data={schema} />
        {children}
    </Suspense>
}