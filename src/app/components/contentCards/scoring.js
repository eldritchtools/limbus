import styles from "./achievement.module.css";

export function getTierStyle(score) {
    if (score > 60) return `${styles.achievement} ${styles.achievementGold}`;
    if (score > 40) return `${styles.achievement} ${styles.achievementSilver}`;
    if (score > 20) return `${styles.achievement} ${styles.achievementBronze}`;
    return "";
}