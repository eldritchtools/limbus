import JsonLd, { getAppSchema } from "../lib/jsonLd";

const name = "Shadow Guesser";
const desc = "Guess things from Limbus Company from their silhouette.";
const path = "/shadow-guesser";

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

export default function ShadowGuesserLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}