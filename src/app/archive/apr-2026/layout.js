import JsonLd, { getWebPageSchema } from "../../lib/jsonLd";

export const metadata = {
    title: "Absolute Pride Resonance 2026",
    description: "Schedule and links to individual events for the Absolute Pride Resonance 2026 community charity event.",
    alternates: {
        canonical: "/apr-2026"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Absolute Pride Resonance 2026",
            description: "Schedule and links to individual events for the Absolute Pride Resonance 2026 community charity event.",
            url: "https://limbus.eldritchtools.com/apr-2026"
        })
    ]
};


export default function APR2026Layout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}