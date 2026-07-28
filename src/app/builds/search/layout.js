import { Suspense } from "react";

export const metadata = {
  title: "Team Builds",
  description: "Browse team builds",
  alternates: {
      canonical: "/builds/search"
  },
  robots: {
    index: false,
    follow: true
  }
};

export default function SearchBuildsLayout({ children }) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}
