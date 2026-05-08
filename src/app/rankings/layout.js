import { Suspense } from "react";

import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Community Rankings",
    description: "See how the community ranks identities and E.G.Os",
    alternates: {
        canonical: "/rankings"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Community Rankings",
            description: "See how the community ranks identities and E.G.Os",
            url: "https://limbus.eldritchtools.com/rankings"
        })
    ]
};

export default function RankingsLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        <Suspense fallback={null}>{children}</Suspense>
    </>;
}
