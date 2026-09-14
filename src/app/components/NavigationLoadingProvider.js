"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useEffect, useRef, useState } from "react";

const NavigationLoadingContext = createContext(null);

export function NavigationLoadingProvider({ children }) {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const timerRef = useRef(null);

    const startNavigation = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        setLoading(true);
        setProgress(10);

        timerRef.current = setInterval(() => {
            setProgress(current => current + (90 - current) * 0.08);
        }, 100);
    }, []);

    useEffect(() => {
        if (!loading)
            return;

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProgress(100);

        const timeout = setTimeout(() => {
            setLoading(false);
            setProgress(0);
        }, 150);

        return () => clearTimeout(timeout);
    }, [pathname, loading]);

    useEffect(() => {
        const handleClick = event => {
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            )
                return;

            const link = event.target.closest("a");

            if (!link) return;
            if (link.origin !== window.location.origin) return;
            if (link.hasAttribute("download")) return;

            const url = new URL(link.href);
            if (
                url.pathname === window.location.pathname &&
                url.search === window.location.search &&
                url.hash
            )
                return;

            startNavigation();
        };

        document.addEventListener("click", handleClick, true);

        return () => {
            document.addEventListener("click", handleClick, true);
        };
    }, [startNavigation]);

    return <NavigationLoadingContext.Provider value={{ startNavigation }}>
        {loading && (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: `${progress}%`,
                    height: "3px",
                    zIndex: 99999,
                    transition: "width 100ms ease-out",
                    pointerEvents: "none",
                    backgroundColor: "#8fa9c9"
                }}
            />
        )}

        {children}
    </NavigationLoadingContext.Provider>
}