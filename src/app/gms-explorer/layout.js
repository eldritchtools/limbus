import { Suspense } from "react";

import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

const name = "GMS Explorer";
const desc = "Interactive map and other details about the Grand Magasin Sysiphe";
const path = "/gms-explorer";

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

export default function GMSExplorerLayout({ children }) {
    return <Suspense fallback={null}>
        <JsonLd data={schema} />
        {children}
    </Suspense>
}