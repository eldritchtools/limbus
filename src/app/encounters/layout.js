import { Suspense } from "react";

import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Encounters",
    description: "View details or relevant builds on various encounters.",
    alternates: {
        canonical: "/encounters"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Encounters",
            description: "View details or relevant builds on various encounters",
            url: "https://limbus.eldritchtools.com/encounters"
        })
    ]
};

export default function EncountersLayout({ children }) {
    return <Suspense fallback={null}>
        <JsonLd data={schema} />
        {children}
    </Suspense>;
}