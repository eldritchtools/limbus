import DropdownButton from "../components/objects/DropdownButton";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";

export default function SettingsTab({ idleSim }) {
    return <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "0.5rem", alignItems: "center" }}>
            <span
                className="hover-text" style={{ textAlign: "end" }}
                {...getGeneralTooltipProps("If enabled, agents who hit 0 HP die instead of being incapacitated for 24 hours.")}
            >
                Permadeath
            </span>

            <DropdownButton
                value={idleSim.getSetting("permadeath")}
                setValue={x => idleSim.setSetting("permadeath", x)}
                options={{ false: "Disabled", true: "Enabled" }}
            />
        </div>
    </div>;
}