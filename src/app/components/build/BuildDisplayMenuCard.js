import styles from "./BuildDisplay.module.css";

export default function BuildDisplayMenuCard({ children }) {
    return <div className={`panel-container ${styles.buildDisplayMenuCard}`}>
        {children}
    </div>
}