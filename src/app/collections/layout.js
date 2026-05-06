import { Suspense } from "react";

import JsonLd from "../lib/jsonLd";

const schema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Collections",
  "url": "https://limbus.eldritchtools.com/collections",
  "isPartOf": {
    "@id": "https://limbus.eldritchtools.com/#website"
  }
};

export default function CollectionsLayout({ children }) {
  return <Suspense fallback={null}>
    <JsonLd data={schema} />
    {children}
  </Suspense>;
}
