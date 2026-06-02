"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./DragContainer.module.css";

export default function DragContainer({ children, className, style, hintDistance=10 }) {
    const ref = useRef(null);

    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const moved = useRef(false);

    const [isScrollable, setIsScrollable] = useState(false);

    const onPointerDown = (e) => {
        if (!ref.current) return;

        isDragging.current = true;
        moved.current = false;

        startX.current = e.clientX;
        scrollLeft.current = ref.current.scrollLeft;
    };

    const onPointerMove = (e) => {
        if (!isDragging.current || !ref.current) return;

        const x = e.clientX;
        const walk = (x - startX.current) * 1.5;

        if (Math.abs(walk) > 5 && !moved.current) {
            moved.current = true;

            // 👇 only now take control
            ref.current.setPointerCapture(e.pointerId);
            document.body.style.userSelect = "none";
        }

        if (moved.current) {
            ref.current.scrollLeft = scrollLeft.current - walk;
        }
    }

    const onPointerUp = (e) => {
        isDragging.current = false;
        document.body.style.userSelect = "";

        if (moved.current && ref.current) {
            ref.current.releasePointerCapture(e.pointerId);
        }

        moved.current = false;
    }

    const onPointerCancel = () => {
        isDragging.current = false;
        document.body.style.userSelect = "";
    };

    useEffect(() => {
        const checkScrollable = () => {
            if (!ref.current) return;
            setIsScrollable(ref.current.scrollWidth > ref.current.clientWidth);
        };

        checkScrollable();

        const ro = new ResizeObserver(checkScrollable);
        if (ref.current) ro.observe(ref.current);

        return () => ro.disconnect();
    }, []);

    return <div
        ref={ref}
        className={`${className} ${styles.scrollContainer} ${isScrollable ? styles.scrollable : ""} ${isScrollable ? styles.hoverHint : ""}`}
        style={style}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
    >
        <div className={styles.container} style={{"--hint-distance": `-${hintDistance}px`}}>
            {children}
        </div>
    </div>
}