import NoPrefetchLink from "../NoPrefetchLink";
import styles from "./ActionTemplate.module.css";

export default function ActionTemplate({ type = "button", active, disabled, onClick, href, children }) {
    const className = (() => {
        switch (type) {
            case "button": return `toggle-button ${active ? "active" : ""} ${disabled ? "disabled" : ""}`;
            case "card-left": return `${styles.cardButton} ${styles.left}`;
            case "card-right": return `${styles.cardButton} ${styles.right}`;
            case "card-middle": return `${styles.cardButton} ${styles.middle}`;
            default: return ""
        }
    })();

    if (href) {
        if (disabled)
            return <div className={className}>
                {children}
            </div>
        else
            return <NoPrefetchLink className={className} href={href}>
                {children}
            </NoPrefetchLink>;
    } else {
        if (type === "button")
            return <button className={className} disabled={disabled} onClick={!disabled ? onClick : undefined}>
                {children}
            </button>;
        else
            return <div className={className} onClick={!disabled ? onClick : undefined}>
                {children}
            </div>
    }
};