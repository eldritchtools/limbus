import styles from "./guide.module.css";
import { guideData } from "./guideData";

function GuideItem({ item }) {
    return (
        <details className={styles.guideItem}>
            <summary className={styles.guideItemSummary}>
                <span style={{ fontWeight: "bold" }}>{item.title}</span>
                <span style={{ color: "var(--secondary-text-color" }}>
                    {item.description}
                </span>
            </summary>

            {item.details && (
                <ul style={{ marginTop: "10px", paddingLeft: "18px", color: "var(--secondary-text-color)" }}>
                    {item.details.map((d, i) => (
                        <li key={i}>{d}</li>
                    ))}
                </ul>
            )}
        </details>
    );
}

export default function GuidePage() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Manager&apos;s Guide</h1>
        <span>
            This page is a directory of everything available on the site. If you&apos;re wondering what a page does, or looking for features you may have missed, you can check this page.
        </span>
        <span className="sub-text">
            Please note that this page may not always be up to date.
        </span>

        <nav style={{ marginBottom: "1rem", padding: "0 12px", border: "1px solid var(--primary-border-color)", borderRadius: "8px" }}>
            <h2 style={{ margin: 0 }}>Contents</h2>
            <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                {guideData.map(section => (
                    <li key={section.id} style={{ margin: "6px 0" }}>
                        <a href={`#${section.id}`} className="text-link">
                            {section.title}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>

        <div>
            {guideData.map(section => (
                <section key={section.id} id={section.id} style={{ paddingTop: "2rem" }}>
                    <h2 style={{ margin: "0.5rem 0" }}>
                        {section.title}
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {section.items.map(item => (
                            <GuideItem key={item.title} item={item} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    </div>
}

