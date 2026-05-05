import JsonLd, { getAppSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Team Solver | Limbus Company Tools",
    description: "Find a team that meets keyword or status requirements and fulfills the requested constraints."
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getAppSchema({
            name: "Team Solver",
            description: "Find a team that meets keyword or status requirements and fulfills the requested constraints for the game Limbus Company.",
            url: "https://limbus.eldritchtools.com/team-solver"
        })
    ]
};

export default function TeamSolverLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}