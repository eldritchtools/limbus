import JsonLd, { getAppSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Dispense and Training Calculator",
    description: "Calculate Dispenser and upgrade costs for Identities and E.G.Os in Limbus Company.",
    alternates: {
        canonical: "/training-calc"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getAppSchema({
            name: "Dispense and Training Calculator",
            description: "Calculate Dispenser and upgrade costs for Identities and E.G.Os in Limbus Company.",
            url: "https://limbus.eldritchtools.com/training-calc"
        })
    ]
};

export default function TrainingCalcLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}