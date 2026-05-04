import JsonLd from "../lib/jsonLd";

export const metadata = {
    title: "Fusions | Limbus Company Tools",
    description: "View fusion recipes for E.G.O gifts in Mirror Dungeons"
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Fusions",
            description: "View fusion recipes for E.G.O gifts in Mirror Dungeons",
            url: "https://limbus.eldritchtools.com/fusions"
        })
    ]
};

export default function FusionsLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}