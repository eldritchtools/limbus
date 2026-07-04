import JsonLd, { getAppSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Team Draft",
    description: "Generate a team through a randomized drafting system for Limbus Company.",
    alternates: {
        canonical: "/team-draft"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getAppSchema({
            name: "Team Draft",
            description: "Generate a team through a randomized drafting system for Limbus Company.",
            url: "https://limbus.eldritchtools.com/team-draft"
        })
    ]
};

export default function TeamDraftLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}