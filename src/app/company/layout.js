import { Suspense } from "react";

export const metadata = {
  title: "Company",
  description: "Manage the Identities and E.G.O you own in Limbus Company for use in your profile and build filtering.",
  robots: {
    index: false,
    follow: false
  }
};

export default function CompanyLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}