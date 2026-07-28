import JsonLd, { getAppSchema } from "../lib/jsonLd";

const name = "Team Solver";
const desc = "Find teams in Limbus Company that satisfy keyword or status requirements and other custom constraints.";
const path = "/team-solver";

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

export default function TeamSolverLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}