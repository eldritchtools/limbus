import styles from "./MapViewer.module.css";

export default function DeathCard({ id, death, greyed, clickable }) {
    return <div key={id}
        className={`${styles.itemCard} ${clickable ? styles.hover : null}`}
        style={{
            "--item-brightness": greyed ? 0.5 : 1,
            "--item-grayscale": greyed ? 0.75 : 0
        }}
        onClick={clickable ?? null}
    >
        <span style={{ fontWeight: "bold" }}>{death.notes}</span>
    </div>
}