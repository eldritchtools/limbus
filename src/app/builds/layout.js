import { Suspense } from "react";

export default function BuildsLayout({ children }) {
  return <Suspense fallback={null}>
    {children}
  </Suspense>;
}
