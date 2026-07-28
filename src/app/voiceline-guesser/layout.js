import JsonLd, { getAppSchema } from "../lib/jsonLd";

const name = "Voiceline Guesser";
const desc = "Guess identities or E.G.O from Limbus Company from small snippets of their voicelines.";
const path = "/voiceline-guesser"

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

export default function VoicelineGuesserLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}