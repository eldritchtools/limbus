import JsonLd, { getAppSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Team Randomizer | Limbus Company Tools",
    description: "Randomize a team. Copy it into a Team Build if you like it."
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getAppSchema({
            name: "Team Randomizer",
            description: "Randomize a team. Copy it into a Team Build if you like it. For the game Limbus Company.",
            url: "https://limbus.eldritchtools.com/team-solver"
        })
    ]
};

export default function TeamRandomizerLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}