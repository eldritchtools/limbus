const name = "About";
const desc = "Learn about Limbus Company Tools, its purpose, and how it’s built.";
const path = "/about";

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

export default function AboutLayout({ children }) {
    return <>{children}</>
}