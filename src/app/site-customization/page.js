"use client";

import { useEffect, useState } from "react";

import GiftIcon from "../components/icons/GiftIcon";
import { useModal } from "../components/modals/ModalProvider";
import NoPrefetchLink from "../components/NoPrefetchLink";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { useSiteCustomization } from "../components/SiteCustomizationProvider";
import { customizationDefaults } from "../lib/customizationDefaults";
import { HomepageLinkList } from "../lib/homepageLinks";

function SettingContainer({ name, desc, children }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.2rem" }}>
        <h3 style={{ margin: 0 }}>{name}</h3>
        <span style={{ fontSize: "0.9rem", color: "#aaa" }}>{desc}</span>
        {children}
    </div>
}

export default function SiteCustomizationPage() {
    const { customizationData, setCustomization } = useSiteCustomization();
    const [data, setData] = useState(customizationData);
    const [loading, setLoading] = useState(true);
    const { openSetFavoriteLinksModal } = useModal();
    const [applying, setApplying] = useState(false);
    const [message, setMessage] = useState(null); 

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData(customizationData ?? {});
        setLoading(false);
    }, [loading, customizationData]);

    const applyCustomization = async () => {
        setApplying(true);
        if(setCustomization(data)) 
            setMessage("Applied!")
        else
            setMessage("Failed to apply.")
        setApplying(false);

        setTimeout(() => setMessage(null), 3000); 
    }

    if (loading) return <LoadingContentPageTemplate />

    return <div style={{
        display: "flex", flexDirection: "column", alignItems: "stretch", gap: "1rem",
        justifySelf: "center", width: "100%", maxWidth: "min(1000px, 95vw)", boxSizing: "border-box"
    }}>
        <h2 style={{ margin: 0 }}>Site Customization</h2>
        <span>Customize various parts of the site to your liking. All settings are saved locally even when logged in. More options will be added here over time. If you have an idea, consider suggesting it on the <NoPrefetchLink className="text-link" href={"/feedback"}>Feedback</NoPrefetchLink> page.</span>

        <SettingContainer
            name={"Favorite Links"}
            desc={"When set, the selected links will be displayed on the homepage. The default list of all links will still be available, but collapsed."}
        >
            <div style={{ display: "flex", gap: "0.2rem" }}>
                <button onClick={() => openSetFavoriteLinksModal({
                    currentList: data.favoriteLinks ?? [],
                    setFavoriteLinks: x => setData(p => ({ ...p, favoriteLinks: x }))
                })}>
                    Set Favorite Links
                </button>
                <button onClick={() => setData(p => ({ ...p, favoriteLinks: customizationDefaults.favoriteLinks }))}>Reset to Default</button>
            </div>
            <div>
                Current List: {data.favoriteLinks ? <HomepageLinkList links={data.favoriteLinks} style={{ maxWidth: "min(1000px, 90vw)" }} /> : "Not Set"}
            </div>
        </SettingContainer>

        <SettingContainer
            name={"Show Gift Tag Strips"}
            desc={"When set, E.G.O gifts will have colored strips on their side, showing their tags at a quick glance. Examples of tags include Enhanceable, Fusion Only, Hard Only, and so on."}
        >
            <label style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <input type="checkbox"
                    checked={data.giftTagStrips ?? customizationDefaults.giftTagStrips}
                    onChange={e => setData(p => ({ ...p, giftTagStrips: e.target.checked }))}
                />
                <span>Toggle Gift Tag Strips</span>
            </label>
            <div style={{ alignSelf: "center" }}>
                <GiftIcon id={"9003"} forceTagStrips={data.giftTagStrips ?? customizationDefaults.giftTagStrips} />
            </div>
        </SettingContainer>

        <div style={{ alignSelf: "center" }}>
            <button onClick={applyCustomization} disabled={applying} style={{ fontSize: "1.2rem" }}>Apply Changes</button>
            <span>{message}</span>
        </div>
    </div>
}
