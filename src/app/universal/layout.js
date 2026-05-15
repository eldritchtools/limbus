import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Universal Gifts & Gift Combos",
    description: "View Universal E.G.O Gifts and Gift Combos in Limbus Company that are useful for most team compositions in Mirror Dungeons.",
    alternates: {
        canonical: "/universal"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Universal Gifts & Gift Combos",
            description: "View Universal E.G.O Gifts and Gift Combos in Limbus Company that are useful for most team compositions in Mirror Dungeons.",
            url: "https://limbus.eldritchtools.com/universal"
        })
    ]
};

export default function UniversalLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}