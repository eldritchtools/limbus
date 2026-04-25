import { Suspense } from "react";

export const metadata = {
    title: "Encounters | Limbus Company Tools",
    description: "View details on various encounters"
};

export default function EncountersLayout({ children }) {
    return <Suspense fallback={null}>{children}</Suspense>;
}