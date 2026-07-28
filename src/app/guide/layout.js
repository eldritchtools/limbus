import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

const name = "Manager's Guide";
const desc = "Guide on site features.";
const path = "/guide";

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

export default function GuideLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}