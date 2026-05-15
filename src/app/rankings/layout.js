import { Suspense } from "react";

import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Community Rankings",
    description: "View community rankings of Limbus Company's Identities and E.G.O based on user ratings and reviews.",
    alternates: {
        canonical: "/rankings"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Community Rankings",
            description: "View community rankings of Limbus Company's Identities and E.G.O based on user ratings and reviews.",
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
