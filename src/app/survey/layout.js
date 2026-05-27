import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Survey Results",
    description: "Partial Results of the recent survey.",
    alternates: {
        canonical: "/survey"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Survey Results",
            description: "Partial Results of the recent survey.",
            url: "https://limbus.eldritchtools.com/survey"
        })
    ]
};


export default function SurveyLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}