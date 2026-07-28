import JsonLd, { getAppSchema } from "../lib/jsonLd";

const name = "Team Draft";
const desc = "Generate a team through a randomized drafting system for Limbus Company.";
const path = "/team-draft";

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
            name: name,
            description: desc,
            url: `https://limbus.eldritchtools.com${path}`
        })
    ]
};

export default function TeamDraftLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}