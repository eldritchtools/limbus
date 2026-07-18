import styles from "./Icon.module.css";

const tierMapping = {
    1: "I", "1": "I",
    2: "II", "2": "II",
    3: "III", "3": "III",
    4: "IV", "4": "IV",
    5: "V", "5": "V"
}

export default function TierIcon({ className, tier, scale = 1, scaleY = 1 }) {
    const combinedClass = className ? `${className} ${styles.tierIcon}` : styles.tierIcon;
    const style = {};
    if(scale !== 1) style.fontSize = `${24 * scale}px`;
    if(scaleY !== 1) style.transform = `scaleY(${scaleY})`;

    return <span className={combinedClass} style={style}>
        {tierMapping[tier] ?? tier}
    </span>
}
