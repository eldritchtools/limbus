import styles from "./BuildDisplay.module.css";

export default function BuildDisplayMenuCard({ children }) {
    return <div className={styles.buildDisplayMenuCard}>
        {children}
    </div>
}