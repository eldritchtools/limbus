import { Suspense } from "react";

export const metadata = {
    title: "Site Customization | Limbus Company Tools",
    description: "Customize various parts of the site"
};

export default function SiteCustomizationLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}