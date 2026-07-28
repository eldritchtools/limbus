import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

const name = "Fusions";
const desc = "Browse fusion recipes for E.G.O gifts in Limbus Company Mirror Dungeons.";
const path = "/fusions";

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

export default function FusionsLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}