import JsonLd, { getAppSchema } from "../lib/jsonLd";

const name = "Dispense and Training Calculator";
const desc = "Calculate Dispenser and upgrade costs for Identities and E.G.Os in Limbus Company.";
const path = "/training-calc"

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

export default function TrainingCalcLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}