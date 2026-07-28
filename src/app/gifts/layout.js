import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

const name = "E.G.O Gifts";
const desc = "Browse E.G.O Gifts available in Limbus Company Mirror Dungeons.";
const path = "/gifts";

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

export default function GiftsLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}