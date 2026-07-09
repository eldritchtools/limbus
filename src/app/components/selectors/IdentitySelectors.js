"use client";

import { isTouchDevice, useBreakpoint } from "@eldritchtools/shared-components";
import * as Select from "@radix-ui/react-select";
import { useMemo, useRef, useState } from "react";

import { useData } from "../DataProvider";
import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";
import styles from "./IdentitySelectors.module.css";
import IdentityIcon from "../icons/IdentityIcon";
import KeywordIcon from "../icons/KeywordIcon";
import SinnerIcon from "../icons/SinnerIcon";
import { useSiteCustomization } from "../SiteCustomizationProvider";
import { getIdentityTooltipProps } from "../tooltips/IdentityTooltip";

import { uiColors } from "@/app/lib/colors";
import { sinnerIdMapping } from "@/app/lib/constants";
import { buildSearchStrings, checkFilterMatch } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";


export function IdentityDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle, options, excludeMode, hideIcons = false, excludeOptions = [] }) {
    const [identities, loading] = useData("identities_mini");
    const [altNames, altNamesLoading] = useData("alt_names");

    const optionsMapped = useMemo(() => loading ? {} : Object.entries(identities).reduce((acc, [id, identity]) => {
        if (options && !options.includes(id) || excludeOptions.includes(id)) return acc;
        acc[id] = {
            value: identity.id,
            label: <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                {!hideIcons && <IdentityIcon id={identity.id} uptie={4} displayName={false} scale={0.125} />}
                <span style={{ minWidth: 0, flex: 1 }}>[{sinnerIdMapping[identity.sinnerId]}] {identity.name}</span>
            </div>,
            searchStrings: buildSearchStrings(identity, altNamesLoading ? null : altNames)
        };
        return acc;
    }, {}), [identities, altNames, options, loading, altNamesLoading, hideIcons, excludeOptions]);

    return <DropdownSelectorWithExclusion
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Search Identities..."}
        filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.searchStrings)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={excludeMode}
    />;
}

export function IdentityMenuSelector({ value, setValue, options, num, menuStyleOverride, uptie = 4, swapIcon }) {
    const { getCustomizationValue } = useSiteCustomization();
    const [altNames, altNamesLoading] = useData("alt_names");
    const [filter, setFilter] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    const { isMobile } = useBreakpoint();

    const filtered = useMemo(() => {
        if (!filter) return options;
        return options.filter((opt) =>
            checkFilterMatch(filter, buildSearchStrings(opt, altNamesLoading ? null : altNames))
        );
    }, [filter, altNames, altNamesLoading, options]);

    const handleOpenChange = (open) => {
        setIsOpen(open);
        setFilter("");
    }

    const buildOption = option => {
        switch (menuStyleOverride ?? getCustomizationValue("idEgoSelectionMenuStyle")) {
            case "iconkw":
                return <Select.Item key={option.id} value={option.id} className={styles.identityMenuSelectorItem}>
                    <div className={styles.identityMenuItemInner} {...getIdentityTooltipProps(option.id)}>
                        <IdentityIcon identity={option} uptie={uptie} displayName={true} displayRarity={true} />
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                            {(option?.skillKeywordList ?? []).map(kw =>
                                <KeywordIcon key={kw} id={kw} size={isMobile ? 24 : 32} />
                            )}
                        </div>
                    </div>
                </Select.Item>
            case "minikw":
                return <Select.Item key={option.id} value={option.id} className={styles.identityMenuSelectorItem}>
                    <div className={styles.identityMenuItemInner} {...getIdentityTooltipProps(option.id)}>
                        <div style={{ display: "flex", width: "100%", alignItems: "start" }}>
                            <IdentityIcon identity={option} uptie={uptie} style={{ width: "25%", aspectRatio: "1/1" }} />
                            <span style={{ fontSize: "0.8rem", width: "75%" }}>
                                {option.name}
                            </span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                            {(option?.skillKeywordList ?? []).map(kw =>
                                <KeywordIcon key={kw} id={kw} size={isMobile ? 24 : 32} />
                            )}
                        </div>
                    </div>
                </Select.Item>
            case "icon":
            default:
                return <Select.Item key={option.id} value={option.id} className={styles.identityMenuSelectorItem}>
                    <div className={styles.identityMenuItemInner} {...getIdentityTooltipProps(option.id)}>
                        <IdentityIcon identity={option} uptie={uptie} displayName={true} displayRarity={true} />
                    </div>
                </Select.Item>
        }
    }

    return <Select.Root value={value ? value.id : null} onValueChange={v => setValue(v)} open={isOpen} onOpenChange={handleOpenChange}>
        <Select.Trigger className={styles.identityMenuSelectorTrigger} ref={triggerRef}>
            {value ? <div {...(isTouchDevice() ? {} : getIdentityTooltipProps(value.id))}
                style={{ width: "100%", position: "relative" }}>
                <IdentityIcon identity={value} uptie={uptie} displayName={true} displayRarity={true} swapIcon={swapIcon} />
            </div> : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                <SinnerIcon num={num} style={{ height: "75%", width: "75%" }} />
            </div>}
        </Select.Trigger>

        <Select.Portal>
            <Select.Content className={styles.identityMenuSelectorContent} position="popper">
                <div style={{ paddingBottom: "0.2rem" }}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>

                <Select.Viewport>
                    <div className={styles.identityMenuSelectorGrid}>
                        {filtered.map((option) => buildOption(option))}
                        {value ? <Select.Item key={"cancel"} value={null} className={styles.identityMenuSelectorItem}>
                            <div className={styles.identityMenuItemInner} style={{ height: "100%", justifyContent: "center", color: uiColors.red, fontSize: "3rem", fontWeight: "bold" }}>
                                ✕
                            </div>
                        </Select.Item> : null}
                    </div>
                    {filtered.length > 12 ? <div className={styles.identityMenuSelectorFadeBottom} > ▼ </div> : null}
                </Select.Viewport>
            </Select.Content>
        </Select.Portal>
    </Select.Root>;
}