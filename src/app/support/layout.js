const name = "Support";
const desc = "Information on supporting Limbus Company Tools and its current supporters.";
const path = "/support";

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

export default function SupportLayout({ children }) {
    return <>{children}</>
}