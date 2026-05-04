import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Team Solver | Limbus Company Tools",
    description: "Find a team meets keyword or status requirements and fulfills the requested constraints."
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Team Solver",
            description: "Find a team meets keyword or status requirements and fulfills the requested constraints",
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