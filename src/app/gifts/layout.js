import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "E.G.O Gifts",
    description: "Browse E.G.O Gifts available in Limbus Company Mirror Dungeons.",
    alternates: {
        canonical: "/gifts"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "E.G.O Gifts",
            description: "Browse E.G.O Gifts available in Limbus Company Mirror Dungeons.",
            url: "https://limbus.eldritchtools.com/gifts"
        })
    ]
};

export default function GiftsLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}