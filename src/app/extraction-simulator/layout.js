import JsonLd, { getAppSchema } from "../lib/jsonLd";

const name = "Extraction Simulator";
const desc = "Simulate extractions on banners or calculate your pulling odds in Limbus Company.";
const path = "/extraction-simulator";

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
        getAppSchema({
            title: name,
            description: desc,
            url: `https://limbus.eldritchtools.com${path}`
        })
    ]
};

export default function ExtractionSimulatorLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}