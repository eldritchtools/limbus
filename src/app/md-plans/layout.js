import { Suspense } from "react";

export const metadata = {
    title: "MD Plans | Limbus Company Tools",
    description: "Browse MD Plans"
};

export default function MdPlansLayout({ children }) {
    return <Suspense fallback={<div>Loading...</div>}>
        {children}
    </Suspense>
}