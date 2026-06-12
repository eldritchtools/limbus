import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Manager's Guide",
    description: "Guide on site features.",
    alternates: {
        canonical: "/guide"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Manager's Guide",
            description: "Guide on site features.",
            url: "https://limbus.eldritchtools.com/guide"
        })
    ]
};


export default function GuideLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}