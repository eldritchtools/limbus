import React, { useEffect, useMemo, useState } from "react";

import styles from "./DistortedText.module.css";

const GLYPHS = "#$%&*@!?▓▒█/\\|";

function randomGlyph() {
    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

export default function DistortedText({ children, animate = true }) {
    const [corruption, setCorruption] = useState(-1);

    useEffect(() => {
        if (!animate) return;

        const interval = setInterval(() => {
            // 15% chance of a quick corruption burst
            if (Math.random() < 0.15) {
                setCorruption(Math.floor(Math.random() * children.length));

                setTimeout(() => {
                    setCorruption(-1);
                }, 70);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [animate, children]);

    const chars = useMemo(() => [...children], [children]);

    return <span className={styles.crtGlitch}>
        <span className={`${styles.crtLayer} ${styles.crtRed}`}>{children}</span>
        <span className={`${styles.crtLayer} ${styles.crtCyan}`}>{children}</span>

        <span className={styles.crtMain}>
            {chars.map((char, i) => (
                <span key={i} className={styles.crtChar}>
                    {i === corruption ? randomGlyph() : char}
                </span>
            ))}
        </span>

        <span className={`${styles.crtLayer} ${styles.crtTear}`}>{children}</span>
        <span className={styles.crtScanlines} />
    </span>
}