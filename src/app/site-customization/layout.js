import { Suspense } from "react";

export const metadata = {
    title: "Site Customization",
    description: "Customize site settings and appearance preferences.",
    robots: {
        index: false,
        follow: false
    }
};

export default function SiteCustomizationLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}