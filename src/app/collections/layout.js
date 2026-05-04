import { Suspense } from "react";

import JsonLd from "../lib/jsonLd";

export const metadata = {
  title: "Collections | Limbus Company Tools",
  description: "Browse collections of content managed by users"
};

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
