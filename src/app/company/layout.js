import { Suspense } from "react";

const name = "Company";
const desc = "Manage the Identities and E.G.O you own in Limbus Company for use in your profile and build filtering.";
const path = "/company";

export const metadata = {
  title: name,
  description: desc,
  robots: {
    index: false,
    follow: false
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

export default function CompanyLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}