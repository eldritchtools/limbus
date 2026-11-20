import styles from "./ThreeStateToggle.module.css";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";

const states = [
    { value: "claimed", label: "Claimed", icon: "✓" },
    { value: "unclaimed", label: "Unclaimed", icon: "○" },
    { value: "excluded", label: "Excluded", icon: "−" }
];

export default function ThreeStateToggle({ value = "unclaimed", onChange, disabled = false }) {
    return <div className={styles.toggle}>
        {states.map(state => <button key={state.value}
            className={`${styles.option} ${styles[state.value]} ${value === state.value ? styles.active : ""}`}
            onClick={() => onChange(state.value)}
            {...getGeneralTooltipProps(state.label)}
            disabled={disabled}
        >
            {state.icon}
        </button>
        )}
    </div>;
}