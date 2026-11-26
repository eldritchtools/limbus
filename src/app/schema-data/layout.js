import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

const name = "Schema Data";
const desc = "Browse data relevant to Limbus Company Schemacraft like costs and packs.";
const path = "/schema-data";

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

export default function SchemaDataLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}