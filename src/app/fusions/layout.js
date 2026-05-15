import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Fusions",
    description: "Browse fusion recipes for E.G.O gifts in Limbus Company Mirror Dungeons.",
    alternates: {
        canonical: "/fusions"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Fusions",
            description: "Browse fusion recipes for E.G.O gifts in Limbus Company Mirror Dungeons.",
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