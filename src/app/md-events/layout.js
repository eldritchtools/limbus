import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

const name = "Choice Events";
const desc = "Browse choice events available in Limbus Company Mirror Dungeons.";
const path = "/md-events";

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

export default function MdEventsLayout({ children }) {
    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "1rem", justifyContent: "start" }}>
        <JsonLd data={schema} />
        {children}
    </div>
}