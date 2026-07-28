import JsonLd, { getAppSchema } from "../lib/jsonLd";

const name = "Artwork Guesser";
const desc = "Guess identities from Limbus Company from small snippets of their artwork.";
const path = "/artwork-guesser";

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

export default function ArtworkGuesserLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}