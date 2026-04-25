import { Suspense } from "react";

export const metadata = {
    title: "Company | Limbus Company Tools",
    description: "Set the identities and E.G.Os you own"
};

export default function CompanyLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}