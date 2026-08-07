import NoPrefetchLink from "../NoPrefetchLink";
import { useSiteCustomization } from "../SiteCustomizationProvider";

export default function ChatSettings() {
    const { getCustomizationValue, setCustomizationValue } = useSiteCustomization();

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p style={{ margin: 0, padding: "0.5rem", textAlign: "center" }}>
            More settings and details can be found in <NoPrefetchLink className="text-link" href={"/site-customization"}>Site Customization</NoPrefetchLink>.
        </p>

        <label style={{ display: "flex", alignItems: "center", gap: "0.2rem", paddingLeft: "0.5rem" }}>
            <input type="checkbox"
                checked={getCustomizationValue("autoConnectGlobalChat")}
                onChange={e => setCustomizationValue("autoConnectGlobalChat", e.target.checked )}
            />
            <span>Automatically join Global Chat</span>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "0.2rem", paddingLeft: "0.5rem" }}>
            <input type="checkbox"
                checked={getCustomizationValue("showPresenceNotifications")}
                onChange={e => setCustomizationValue("showPresenceNotifications", e.target.checked )}
            />
            <span>Show Presence Notifications</span>
        </label>
    </div>
}
