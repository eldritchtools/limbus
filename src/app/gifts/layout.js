import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "E.G.O Gifts | Limbus Company Tools",
    description: "View E.G.O Gifts that show up in Mirror Dungeons"
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "E.G.O Gifts",
            description: "View E.G.O Gifts that show up in Mirror Dungeons",
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