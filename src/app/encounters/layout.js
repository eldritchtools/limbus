import { Suspense } from "react";

export default function EncountersLayout({ children }) {
    return <Suspense fallback={null}>
        {children}
    </Suspense>;
}