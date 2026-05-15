import { Suspense } from "react";

export const metadata = {
    title: "Site Customization",
    description: "Customize site settings and appearance preferences."
};

export default function SiteCustomizationLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}