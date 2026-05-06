import { Suspense } from "react";

export default function MdPlansLayout({ children }) {
    return <Suspense fallback={<div>Loading...</div>}>
        {children}
    </Suspense>
}