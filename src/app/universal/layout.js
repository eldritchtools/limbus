import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Universal Gifts & Gift Combos | Limbus Company Tools",
    description: "View gifts & gift combos that are useful for any team in Mirror Dungeons"
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Universal Gifts & Gift Combos",
            description: "View gifts & gift combos that are useful for any team in Mirror Dungeons",
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