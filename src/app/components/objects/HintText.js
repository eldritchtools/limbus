import { useEffect } from "react";

import styles from "./HintText.module.css";

export default function HintText({ hintText, setHintText, children }) {
    useEffect(() => {
        if (hintText && setHintText) {
            setTimeout(() => {
                setHintText(false);
            }, 1500);
        }
    }, [hintText, setHintText]);

    return <div style={{ position: "relative", display: "inline-block" }}>
        {hintText && <div className={styles.hint}>{hintText}</div>}

        <span style={{ cursor: "pointer" }}>
            {children}
        </span>
    </div>;
}