import JsonLd, { getAppSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Artwork Guesser",
    description: "Guess identities from Limbus Company from small snippets of their artwork.",
    alternates: {
        canonical: "/artwork-guesser"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getAppSchema({
            name: "Artwork Guesser",
            description: "Guess identities from Limbus Company from small snippets of their artwork.",
            url: "https://limbus.eldritchtools.com/artwork-guesser"
        })
    ]
};

export default function ArtworkGuesserLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}