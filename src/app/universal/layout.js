import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

const name = "Universal Gifts & Gift Combos";
const desc = "View Universal E.G.O Gifts and Gift Combos in Limbus Company that are useful for most team compositions in Mirror Dungeons.";
const path = "/universal"

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

export default function UniversalLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}