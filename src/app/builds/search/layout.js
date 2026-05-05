import { Suspense } from "react";

export const metadata = {
  title: "Team Builds",
  description: "Browse team builds",
  robots: {
    index: false,
    follow: false
  }
};

export default function SearchBuildsLayout({ children }) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}
