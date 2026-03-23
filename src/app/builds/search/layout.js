import { Suspense } from "react";

export const metadata = {
    title: "Team Builds | Limbus Company Tools",
    description: "Browse team builds"
};

export default function SearchBuildsLayout({ children }) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}
