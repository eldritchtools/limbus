"use client";

import { useRef, useState } from "react";

import styles from "./HoldButton.module.css";

export default function HoldButton({ onConfirm, children = "Pass", duration = 1000 }) {
    const timerRef = useRef(null);
    const [holding, setHolding] = useState(false);

    function startHold(e) {
        if (e.button !== undefined && e.button !== 0) return;

        e.preventDefault();
        clearTimeout(timerRef.current);
        setHolding(true);

        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            setHolding(false);
            onConfirm();
        }, duration);
    }

    function cancelHold() {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        setHolding(false);
    }

    return <button
        type="button"
        className={`${styles.button} ${holding ? styles.holding : ""}`} style={{ "--hold-duration": `${duration}ms` }}
        onPointerDown={startHold} onPointerUp={cancelHold} onPointerLeave={cancelHold} onPointerCancel={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
    >
        <svg className={styles.progress} aria-hidden="true"> 
            <rect pathLength="100" x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="7" /> 
        </svg>
        <span>{children}</span>
    </button>
}
