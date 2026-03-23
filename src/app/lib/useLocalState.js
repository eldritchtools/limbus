"use client";

import { useState, useEffect, useCallback } from "react";

export default function useLocalState(key, defaultValue) {
    const [state, setState] = useState(defaultValue);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(key);
            
            if (stored !== null) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setState(JSON.parse(stored));
            }
            setInitialized(true);
        } catch (error) {
            setState(defaultValue);
        }
    }, [key, defaultValue]);

    const setLocalState = useCallback(
        (value) => {
            setState((prev) => {
                const nextValue = typeof value === "function" ? value(prev) : value;

                try {
                    localStorage.setItem(key, JSON.stringify(nextValue));
                } catch (error) {
                    console.error("Error writing localStorage key:", key, error);
                }

                return nextValue;
            });
        },
        [key]
    );

    return [state, setLocalState, initialized];
}
