import { Suspense } from "react";

import JsonLd from "../lib/jsonLd";

export const metadata = {
  title: "Team Builds | Limbus Company Tools",
  description: "Browse team builds"
};

const schema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Team Builds",
  "url": "https://limbus.eldritchtools.com/builds",
  "isPartOf": {
    "@id": "https://limbus.eldritchtools.com/#website"
  }
};

export default function BuildsLayout({ children }) {
  return <Suspense fallback={null}>
    <JsonLd data={schema} />
    {children}
  </Suspense>;
}
