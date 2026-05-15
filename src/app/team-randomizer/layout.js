import JsonLd, { getAppSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Team Randomizer",
    description: "Generate a randomized team with customizable constraints for Limbus Company and export it to a Team Build.",
    alternates: {
        canonical: "/team-randomizer"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getAppSchema({
            name: "Team Randomizer",
            description: "Generate a randomized team with customizable constraints for Limbus Company and export it to a Team Build.",
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