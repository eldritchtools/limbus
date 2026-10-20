import JsonLd, { getAppSchema } from "../lib/jsonLd";

const name = "Community Trivia Quiz";
const desc = "Answer trivia questions submitted by the community.";
const path = "/community-trivia";

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

export default function CommunityTriviaLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}