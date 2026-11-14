import styles from "./BuildDisplay.module.css";

export default function BuildDisplayMenuCard({ children, width, height }) {
    return <div className={`panel-container ${styles.buildDisplayMenuCard}`} style={{ width: width, height: height }}>
        {children}
    </div>
}