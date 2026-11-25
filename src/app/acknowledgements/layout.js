const name = "Acknowledgements";
const desc = "Information on contributing to Limbus Company Tools.";
const path = "/acknowledgements";

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

export default function AcknowledgementsLayout({ children }) {
    return <>{children}</>
}