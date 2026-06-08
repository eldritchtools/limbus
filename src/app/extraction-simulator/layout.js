import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Extraction Simulator",
    description: "Simulate extractions on banners in Limbus Company.",
    alternates: {
        canonical: "/extraction-simulator"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Extraction Simulator",
            description: "Simulate extractions on banners in Limbus Company.",
            url: "https://limbus.eldritchtools.com/extraction-simulator"
        })
    ]
};

export default function ExtractionSimulatorLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}