import JsonLd, { getAppSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Dispense and Training Calculator",
    description: "A calculator for the costs from the Dispenser and for upgrading identities and E.G.Os",
    alternates: {
        canonical: "/training-calc"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getAppSchema({
            name: "Dispense and Training Calculator",
            description: "A calculator for the costs from the Dispenser and for upgrading identities and E.G.Os for the game Limbus Company.",
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