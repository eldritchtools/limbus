"use client";
import styles from "./PageHeader.module.css";

export default function PageHeader({ title, mainDesc, subDesc, children, wide = false }) {
    return <div className={`${styles.pageHeader} ${wide ? styles.wide : ""}`}>
        <div className={styles.pageHeaderContent}>
            <h1>{title}</h1>
            <p style={{ maxWidth: "1200px" }}>{mainDesc}</p>
            <p className="sub-text" style={{ maxWidth: "1280px" }}>{subDesc}</p>
            {children}
        </div>
    </div>
}