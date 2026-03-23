import { Suspense } from "react";

export const metadata = {
    title: "Team Builds | Limbus Company Tools",
    description: "Browse team builds"
};

export default function BuildsLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
