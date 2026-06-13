import React from "react";

import styles from "./AnswerSection.module.css";

export default function AnswerSection({ total, texts, values, average }) {
    return <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "0.2rem" }}>
        {average ? 
        <span>
            Average: {(texts.reduce((acc, x, i) => acc + x * values[i], 0) / total).toFixed(2)}
        </span>
        : null}
        {texts.map((option, i) => {
            const pct = total ? (100 * values[i] / total) : 0;
            return <React.Fragment key={i}>
                <div style={{ textAlign: "start", gridColumn: "span 2" }}>
                    {option}{` (${values[i]} vote${values[i] !== 1 ? "s" : ""})`}
                </div>

                <div className={styles.bar}>
                    <div className={styles.barFill} style={{ width: `${pct}%` }} />
                </div>
                <div>{pct.toFixed(0)}%</div>
            </React.Fragment>
        })}
    </div>
}
