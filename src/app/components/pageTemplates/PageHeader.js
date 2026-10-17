"use client";
import styles from "./PageHeader.module.css";
import NitroAd from "../ads/NitroAd";

export default function PageHeader({ title, mainDesc, subDesc, children, wide = false, showAd = true, maxAds = 1 }) {
    return <div className={`${styles.pageHeader} ${wide ? styles.wide : ""}`}>
        {showAd && <div className={styles.pageHeaderAdMobile}>
            <NitroAd id={"page-header-top-ad"} height={90} adLevel={"min"} />
        </div>}

        <div className={styles.pageHeaderContent}>
            <h1>{title}</h1>
            <p style={{ maxWidth: "1200px" }}>{mainDesc}</p>
            <p className="sub-text" style={{ maxWidth: "1280px" }}>{subDesc}</p>
            {children}
        </div>

        {showAd && <div className={styles.pageHeaderAdDesktop}>
            {Array.from({ length: maxAds }, (_, index) => (
                <NitroAd key={index} id={`page-header-side-ad-${index + 1}`} style={{ width: "300px" }} adLevel={"min"} />
            ))}
        </div>}
    </div>
}