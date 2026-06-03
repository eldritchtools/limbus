"use client";

import { useEffect, useMemo, useState } from "react";

import ColorPicker from "./ColorPicker";
import EgoIcon from "../components/icons/EgoIcon";
import GiftIcon from "../components/icons/GiftIcon";
import IdentityIcon from "../components/icons/IdentityIcon";
import { useModal } from "../components/modals/ModalProvider";
import NoPrefetchLink from "../components/NoPrefetchLink";
import { HorizontalDivider } from "../components/objects/Dividers";
import DropdownButton from "../components/objects/DropdownButton";
import Slider from "../components/objects/Slider";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import IconsSelector from "../components/selectors/IconsSelector";
import { useSiteCustomization } from "../components/SiteCustomizationProvider";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { useAuth } from "../database/authProvider";
import { deleteCustomization, loadCustomization, saveCustomization } from "../database/customization";
import { uiColors } from "../lib/colors";
import { customizationDefaults } from "../lib/customizationDefaults";
import { HomepageLinkList } from "../lib/homepageLinks";

function SettingContainer({ name, desc, children }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.2rem" }}>
        <h3 style={{ margin: 0 }}>{name}</h3>
        <span className="sub-text">{desc}</span>
        {children}
    </div>
}

const filterSelectionModes = {
    "ieo": "Include/Exclude/Off",
    "lr": "Include & Exclude",
    "st": "Simple Toggle"
}

const filterModeDescriptions = {
    "ieo": "Include/Exclude/Off: Clicking on a filter cycles it between include, exclude, and off.",
    "lr": "Include & Exclude: Left clicking includes a filter, right clicking excludes it. Left/Right click again to turn off. On mobile, use a long press in place of right click.",
    "st": "Simple Toggle: Left clicking on a filter toggles between include and off. No exclude."
}

const presetOptions = {
    "default": "Dark Mode (default)",
    "deep-dark": "Deep Dark",
    "soft-dark": "Soft Dark",
    "light": "Light Mode",
    "warm": "Warm Light",
    "dim": "Dim"
}

const presets = {
    "default": ["#1f1f1f", "#dddddd", 0.05],
    "deep-dark": ["#000000", "#e5e5e5", 0.08],
    "soft-dark": ["#262626", "#cfcfcf", 0.03],
    "light": ["#ffffff", "#222222", 0.06],
    "warm": ["#f4f1ea", "#2c2a26", 0.05],
    "dim": ["#2d2f34", "#e0e3e7", 0.05]
}

const fontOptions = {
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif": "Default",
    "'Inter', sans-serif": "Inter",
    "'Merriweather', serif": "Serif",
    "'JetBrains Mono', monospace": "Monospace"
};

export default function SiteCustomizationPage() {
    const { customizationData, setCustomization, createPreviewContainer } = useSiteCustomization();
    const [data, setData] = useState(customizationData);
    const [loading, setLoading] = useState(true);
    const { openSetFavoriteLinksModal } = useModal();
    const [applying, setApplying] = useState(false);
    const [message, setMessage] = useState(null);
    const [filterPreview, setFilterPreview] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData(customizationData ?? {});
        setLoading(false);
    }, [loading, customizationData]);

    const applyCustomization = async () => {
        setApplying(true);
        if (setCustomization(data))
            setMessage("Applied!")
        else
            setMessage("Failed to apply.")
        setApplying(false);

        setTimeout(() => setMessage(null), 3000);
    }

    const resetCustomization = async () => {
        setApplying(true);
        if (setCustomization({}))
            setMessage("Settings have been reset!")
        else
            setMessage("Failed to reset.")
        setApplying(false);

        setTimeout(() => setMessage(null), 3000);
    }

    const handleSaveCustomization = async () => {
        setApplying(true);
        const result = await saveCustomization(user.id, customizationData);
        if (result)
            setMessage(`Settings saved!`)
        else
            setMessage("Failed to save.")
        setApplying(false);

        setTimeout(() => setMessage(null), 3000);
    }

    const handleLoadCustomization = async () => {
        setApplying(true);
        const result = await loadCustomization();
        if (result) {
            setCustomization(result.settings);
            setMessage(`Saved settings loaded!`)
        } else
            setMessage("Failed to load.")
        setApplying(false);

        setTimeout(() => setMessage(null), 3000);
    }

    const handleDeleteCustomization = async () => {
        setApplying(true);
        await deleteCustomization(user.id);
        setMessage(`Settings deleted!`)
        setApplying(false);

        setTimeout(() => setMessage(null), 3000);

    }

    const [currentPreset, currentFont, currentFilterSelectionMode] = useMemo(() => {
        if (loading) return ["default", fontOptions["Default"]];
        const preset = Object.entries(presets).find(([id, [bg, text, sc]]) =>
            ((data.baseBackgroundColor ?? customizationDefaults.baseBackgroundColor) === bg) &&
            ((data.baseTextColor ?? customizationDefaults.baseTextColor) === text) &&
            ((data.surfaceContrast ?? customizationDefaults.surfaceContrast) === sc)
        )

        const font = Object.entries(fontOptions).find(([value]) => (data.font ?? customizationDefaults.font) === value)

        const filterMode = Object.entries(filterSelectionModes).find(([value]) => (data.filterSelectionMode ?? customizationDefaults.filterSelectionMode) === value)

        return [
            preset ? preset[0] : "custom",
            font ? font[0] : "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            filterMode ? filterMode[0] : "ieo"
        ]
    }, [data, loading]);

    const setPreset = preset => {
        setData(p => ({
            ...p,
            baseBackgroundColor: presets[preset][0],
            baseTextColor: presets[preset][1],
            surfaceContrast: presets[preset][2]
        }))
    }

    const changePreset = delta => {
        if (currentPreset === "custom") setPreset("default");
        else {
            const list = Object.keys(presets);
            let index = list.findIndex(x => x === currentPreset) + delta;
            if (index < 0) index = list.length - 1;
            else if (index >= list.length) index = 0;
            setPreset(list[index]);
        }
    }

    const changeFont = delta => {
        const list = Object.keys(fontOptions);
        let index = list.findIndex(x => x === currentFont) + delta;
        if (index < 0) index = list.length - 1;
        else if (index >= list.length) index = 0;
        setData(p => ({ ...p, font: list[index] }));
    }

    const changeFilterSelectionMode = delta => {
        const list = Object.keys(filterSelectionModes);
        let index = list.findIndex(x => x === currentFilterSelectionMode) + delta;
        if (index < 0) index = list.length - 1;
        else if (index >= list.length) index = 0;
        setData(p => ({ ...p, filterSelectionMode: list[index] }));
    }

    if (loading) return <LoadingContentPageTemplate />

    return <div style={{
        display: "flex", flexDirection: "column", alignItems: "stretch", gap: "1rem",
        justifySelf: "center", width: "100%", maxWidth: "min(1000px, 95vw)", boxSizing: "border-box"
    }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, textAlign: "center" }}>Site Customization</h1>
        <span style={{ textAlign: "center" }}>Customize site settings and appearance preferences.</span>
        <div className="sub-text">
            Settings are saved locally on your device and persist even when logged in.
            <br /> <br />
            More customization options will be added over time. Suggestions can be submitted via the <NoPrefetchLink className="text-link" href={"/feedback"}>Feedback</NoPrefetchLink> page.</div>

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

        <SettingContainer
            name={"Filter Selection Mode"}
            desc={"Change how the filter selection menus work."}
        >
            <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                <button onClick={() => changeFilterSelectionMode(-1)}>{"<"}</button>
                <DropdownButton value={currentFilterSelectionMode} setValue={v => setData(p => ({ ...p, filterSelectionMode: v }))} options={filterSelectionModes} />
                <button onClick={() => changeFilterSelectionMode(1)}>{">"}</button>
            </div>
            <span>
                {filterModeDescriptions[currentFilterSelectionMode]}
            </span>
            <IconsSelector
                type={"row"}
                categories={["sinner", "status", "affinity", "skillType"]}
                values={filterPreview} setValues={setFilterPreview}
                filterModeOverride={currentFilterSelectionMode}
            />
        </SettingContainer>

        <SettingContainer
            name={"Ratings on Tooltips"}
            desc={"Show community ratings on identity and E.G.O tooltips. As always, remember that ratings are community-submitted and not always reliable."}
        >
            <label style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <input type="checkbox"
                    checked={data.ratingsOnTooltips ?? customizationDefaults.ratingsOnTooltips}
                    onChange={e => setData(p => ({ ...p, ratingsOnTooltips: e.target.checked }))}
                />
                <span>Show Ratings on Tooltips</span>
            </label>

            <div style={{ display: "flex" }}>
                <div style={{ width: "128px", height: "128px" }}>
                    <IdentityIcon id={10101} uptie={4} displayName={true} displayRarity={true} includeTooltip={true} forceRatingsOnTooltip={data.ratingsOnTooltips ? "show" : "hide"} />
                </div>
                <div style={{ width: "128px", height: "128px" }}>
                    <EgoIcon id={20101} type={"awaken"} displayName={true} displayRarity={true} includeTooltip={true} forceRatingsOnTooltip={data.ratingsOnTooltips ? "show" : "hide"} />
                </div>
            </div>
        </SettingContainer>

        <SettingContainer
            name={"Share Button Behavior"}
            desc={"By default, the share button will use your browser's share menu. You can disable this if you want it to simply copy the page link."}
        >
            <label style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <input type="checkbox"
                    checked={data.disableShareMenu ?? customizationDefaults.disableShareMenu}
                    onChange={e => setData(p => ({ ...p, disableShareMenu: e.target.checked }))}
                />
                <span>Disable Share Menu</span>
            </label>
        </SettingContainer>

        <SettingContainer
            name={"Site Display Settings"}
            desc={<div>Change the base colors and other display settings on the site. Multiple other colors will be derived from the chosen base colors. These settings will not affect things with predefined colors or font settings. <span style={{ fontSize: "0.8rem", color: uiColors.red }}>Caution: The site is mainly designed with the default settings in mind (darker backgrounds and lighter texts). Using other settings may cause parts of the site to be difficult to see or may cause some layouts to break. Certain colors may be changed over time to accommodate for both light and dark backgrounds.
            </span></div>}
        >
            <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "0.5rem", alignSelf: "center", alignItems: "center", textAlign: "center" }}>
                <div>
                    <span className="hover-text" {...getGeneralTooltipProps("Preset values for color settings")}>
                        Preset
                    </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
                    <DropdownButton value={currentPreset} setValue={setPreset} options={presetOptions} defaultDisplay={"Custom"} />
                    <div style={{ display: "flex", gap: "0.2rem", justifyContent: "center" }}>
                        <button onClick={() => changePreset(-1)}>{"<"}</button>
                        <button onClick={() => changePreset(1)}>{">"}</button>
                    </div>
                </div>
                <div>
                    <span className="hover-text" {...getGeneralTooltipProps("Color used for most backgrounds. Other background and border colors will be derived from this.")}>
                        Base Background Color
                    </span>
                </div>
                <div>
                    <ColorPicker
                        value={data.baseBackgroundColor ?? customizationDefaults.baseBackgroundColor}
                        onChange={x => setData(p => ({ ...p, baseBackgroundColor: x }))}
                    />
                </div>
                <div>
                    <span className="hover-text" {...getGeneralTooltipProps("Color used for most texts. Other text and border colors will be derived from this.")}>
                        Base Text Color
                    </span>
                </div>
                <div>
                    <ColorPicker
                        value={data.baseTextColor ?? customizationDefaults.baseTextColor}
                        onChange={x => setData(p => ({ ...p, baseTextColor: x }))}
                    />
                </div>
                <div>
                    <span className="hover-text" {...getGeneralTooltipProps("How big the contrast between backgrounds will be. Higher values will make backgrounds have higher contrast with each other.")}>
                        Surface Contrast
                    </span>
                </div>
                <div>
                    <Slider
                        value={data.surfaceContrast ?? customizationDefaults.surfaceContrast}
                        onChange={v => setData(p => ({ ...p, surfaceContrast: v }))}
                        min={0} max={0.5} step={.01}
                    />
                </div>
                <div>
                    <span className="hover-text" {...getGeneralTooltipProps("How big texts will be. By default, font size automatically scales based on the screen size. This setting gives you additional control to fine tune the final size.")}>
                        Text Scaling
                    </span>
                </div>
                <div>
                    <Slider
                        value={data.textScale ?? customizationDefaults.textScale}
                        onChange={v => {
                            if (v === 0)
                                setData(p => {
                                    const { textScale: d, ...rem } = p;
                                    return rem;
                                })
                            else
                                setData(p => ({ ...p, textScale: v }))
                        }}
                        min={0.5} max={3} step={.1}
                    />
                </div>
                <div>
                    <span className="hover-text" {...getGeneralTooltipProps("Font used for text on the site")}>
                        Font Style
                    </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
                    <DropdownButton value={currentFont} setValue={v => setData(p => ({ ...p, font: v }))} options={fontOptions} />
                    <div style={{ display: "flex", gap: "0.2rem", justifyContent: "center" }}>
                        <button onClick={() => changeFont(-1)}>{"<"}</button>
                        <button onClick={() => changeFont(1)}>{">"}</button>
                    </div>
                </div>
            </div>
            <div style={{ alignSelf: "center" }}>
                {createPreviewContainer({
                    baseBackgroundColor: data.baseBackgroundColor ?? customizationDefaults.baseBackgroundColor,
                    baseTextColor: data.baseTextColor ?? customizationDefaults.baseTextColor,
                    surfaceContrast: data.surfaceContrast ?? customizationDefaults.surfaceContrast,
                    textScale: data.textScale ?? customizationDefaults.textScale,
                    font: data.font ?? customizationDefaults.font,
                    children:
                        <div style={{ background: "var(--bg-primary)", padding: "0.5em" }}>
                            <div className="panel-container" style={{ gap: "0.2rem" }}>
                                <span className="title-text" style={{ fontSize: "1.2em" }}>Display Preview</span>
                                <span className="sub-text" style={{ fontSize: "0.8em" }}>Preview text</span>
                                <HorizontalDivider />
                                <span>Preview Description</span>
                                <button>Preview Button</button>
                            </div>
                        </div>
                })}
            </div>
        </SettingContainer>

        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem"}}>
            <div style={{ display: "flex", alignSelf: "center", justifyContent: "center" }}>
                <button onClick={applyCustomization} disabled={applying} style={{ fontSize: "1.2rem" }}>Apply Changes</button>
                <button onClick={resetCustomization} disabled={applying} style={{ fontSize: "1.2rem" }}>Reset All to Default</button>
            </div>
            <span>Customization Backup</span>
            <span className="sub-text">Backup your currently applied settings to more easily transfer them between devices.</span>
            <div style={{ display: "flex", alignSelf: "center", justifyContent: "center" }}>
                <button onClick={handleSaveCustomization} disabled={applying} style={{ fontSize: "1rem" }}>Backup</button>
                <button onClick={handleLoadCustomization} disabled={applying} style={{ fontSize: "1rem" }}>Restore</button>
                <button onClick={handleDeleteCustomization} disabled={applying} style={{ fontSize: "1rem" }}>Delete Backup</button>
            </div>
            <div style={{ display: "flex", alignSelf: "center", justifyContent: "center" }}>
                <span>{message}</span>
            </div>
        </div>
    </div>
}
