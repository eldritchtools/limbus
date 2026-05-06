import { Suspense } from "react";

export default function CollectionsLayout({ children }) {
  return <Suspense fallback={null}>
    {children}
  </Suspense>;
}
