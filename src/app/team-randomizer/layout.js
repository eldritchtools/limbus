import JsonLd, { getAppSchema } from "../lib/jsonLd";

const name = "Team Randomizer";
const desc = "Generate a randomized team with customizable constraints for Limbus Company and export it to a Team Build.";
const path = "/team-randomizer";

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

export default function TeamRandomizerLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}