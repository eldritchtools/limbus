import JsonLd, { getAppSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Voiceline Guesser",
    description: "Guess identities or E.G.O from Limbus Company from small snippets of their voicelines.",
    alternates: {
        canonical: "/voiceline-guesser"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getAppSchema({
            name: "Voiceline Guesser",
            description: "Guess identities or E.G.O from Limbus Company from small snippets of their voicelines.",
            url: "https://limbus.eldritchtools.com/voiceline-guesser"
        })
    ]
};

export default function VoicelineGuesserLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}