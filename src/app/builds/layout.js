import { Suspense } from "react";

import JsonLd from "../lib/jsonLd";

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
