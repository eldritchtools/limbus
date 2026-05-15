import JsonLd, { getAppSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Team Solver",
    description: "Find teams in Limbus Company that satisfy keyword or status requirements and other custom constraints.",
    alternates: {
        canonical: "/team-solver"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getAppSchema({
            name: "Team Solver",
            description: "Find teams in Limbus Company that satisfy keyword or status requirements and other custom constraints.",
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