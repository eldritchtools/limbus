"use client";

import { isTouchDevice } from "@eldritchtools/shared-components";
import * as Select from "@radix-ui/react-select";
import { useMemo, useRef, useState } from "react";

import { useData } from "../DataProvider";
import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";
import styles from "./IdentitySelectors.module.css";
import IdentityIcon from "../icons/IdentityIcon";
import SinnerIcon from "../icons/SinnerIcon";
import { getIdentityTooltipProps } from "../tooltips/IdentityTooltip";

import { sinnerIdMapping } from "@/app/lib/constants";
import { checkFilterMatch } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";


export function IdentityDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle, excludeMode }) {
    const [identities, loading] = useData("identities_mini");

    const optionsMapped = useMemo(() => loading ? {} : Object.entries(identities).reduce((acc, [id, identity]) => {
        acc[id] = {
            value: identity.id,
            label: <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", maxWidth: "65vw" }}>
                <IdentityIcon id={identity.id} uptie={4} displayName={false} scale={0.125} />
                <span>[{sinnerIdMapping[identity.sinnerId]}] {identity.name}</span>
            </div>,
            searchStrings: [identity.name, sinnerIdMapping[identity.sinnerId]]
        };
        return acc;
    }, {}), [identities, loading]);

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

export function IdentityMenuSelector({ value, setValue, options, num }) {
    const [filter, setFilter] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);

    const filtered = useMemo(() => {
        if (!filter) return options;
        return options.filter((opt) =>
            opt.name.toLowerCase().includes(filter.toLowerCase())
        );
    }, [filter, options]);

    const handleOpenChange = (open) => {
        setIsOpen(open);
        setFilter("");
    }

    return <Select.Root value={value ? value.id : null} onValueChange={v => setValue(v)} open={isOpen} onOpenChange={handleOpenChange}>
        <Select.Trigger className={styles.identityMenuSelectorTrigger} ref={triggerRef}>
            {value ? <div {...(isTouchDevice() ? {} : getIdentityTooltipProps(value.id))}
                style={{ width: "100%", position: "relative" }}>
                <IdentityIcon identity={value} uptie={4} displayName={true} displayRarity={true} />
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
                        {filtered.map((option) =>
                            <Select.Item key={option.id} value={option.id} className={styles.identityMenuSelectorItem}>
                                <div className={styles.identityMenuItemInner} {...getIdentityTooltipProps(option.id)}>
                                    <IdentityIcon identity={option} uptie={4} displayName={true} displayRarity={true} />
                                </div>
                            </Select.Item>
                        )}
                        {value ? <Select.Item key={"cancel"} value={null} className={styles.identityMenuSelectorItem}>
                            <div className={styles.identityMenuItemInner} style={{ height: "100%", justifyContent: "center", color: "#ff4848", fontSize: "3rem", fontWeight: "bold" }}>
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