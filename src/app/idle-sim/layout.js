import JsonLd, { getAppSchema } from "../lib/jsonLd";

const name = "LC Idle Management Sim";
const desc = "Manage your own Limbus Company Facility in an idle management simulator game.";
const path = "/idle-sim";

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
            title: name,
            description: desc,
            url: `https://limbus.eldritchtools.com${path}`
        })
    ]
};

export default function IdleSimLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}