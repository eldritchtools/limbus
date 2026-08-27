import { Suspense } from "react";

import JsonLd, { getAppSchema } from "../lib/jsonLd";

const name = "Clash Arena";
const desc = "";
const path = "/clash-arena"

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
        getAppSchema({
            name: name,
            description: desc,
            url: `https://limbus.eldritchtools.com${path}`
        })
    ]
};

export default function ClashArenaLayout({ children }) {
    return <Suspense fallback={null}>
        <JsonLd data={schema} />
        {children}
    </Suspense>
}