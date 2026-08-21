import { Suspense } from "react";

import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

const name = "Creator Directory";
const desc = "Browse a directory of Project Moon content creators with searchable listings and community-sourced content tags.";
const path = "/creators"

export const metadata = {
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

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: name,
            description: desc,
            url: `https://limbus.eldritchtools.com${path}`
        })
    ]
};

export default function CreatorsLayout({ children }) {
    return <Suspense fallback={null}>
        <JsonLd data={schema} />
        {children}
    </Suspense>
}