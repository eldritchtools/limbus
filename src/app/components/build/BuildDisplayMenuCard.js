import styles from "./BuildDisplay.module.css";

export default function BuildDisplayMenuCard({ children, width }) {
    return <div className={`panel-container ${styles.buildDisplayMenuCard}`} style={{width: width}}>
        {children}
    </div>
}