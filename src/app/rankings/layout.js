import { Suspense } from "react";

import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

const name = "Community Rankings";
const desc = "View community rankings of Limbus Company's Identities and E.G.O based on user ratings and reviews.";
const path = "/rankings";

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

export default function RankingsLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        <Suspense fallback={null}>{children}</Suspense>
    </>;
}
