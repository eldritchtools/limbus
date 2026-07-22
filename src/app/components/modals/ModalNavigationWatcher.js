import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ModalNavigationWatcher({ clearModals }) {
    const pathname = usePathname();

    useEffect(() => {
        clearModals();
    }, [pathname, clearModals]);

    return null;
}