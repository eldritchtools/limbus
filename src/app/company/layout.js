import { Suspense } from "react";

export const metadata = {
  title: "Company",
  description: "Set the identities and E.G.Os you own",
  robots: {
    index: false,
    follow: false
  }
};

export default function CompanyLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}