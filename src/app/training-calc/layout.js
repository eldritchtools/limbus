import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Dispense and Training Calculator | Limbus Company Tools",
    description: "A calculator for the costs from the Dispenser and for upgrading identities and E.G.Os"
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Dispense and Training Calculator",
            description: "A calculator for the costs from the Dispenser and for upgrading identities and E.G.Os",
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