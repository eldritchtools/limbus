"use client";

import { isTouchDevice } from "@eldritchtools/shared-components";
import * as Select from "@radix-ui/react-select";
import { useMemo, useRef, useState } from "react";

import { useData } from "../DataProvider";
import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";
import styles from "./EgoSelectors.module.css";
import EgoIcon from "../icons/EgoIcon";
import RarityIcon from "../icons/RarityIcon";
import { getEgoTooltipProps } from "../tooltips/EgoTooltip";

import { affinityColorMapping } from "@/app/lib/colors";
import { egoRanks, sinnerIdMapping } from "@/app/lib/constants";
import { checkFilterMatch } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";

export function EgoDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle, excludeMode }) {
    const [egos, loading] = useData("egos_mini");

    const optionsMapped = useMemo(() => loading ? [] : Object.entries(egos).reduce((acc, [id, ego]) => {
        acc[id] = {
            value: ego.id,
            label: <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", maxWidth: "65vw" }}>
                <EgoIcon id={ego.id} type={"awaken"} displayName={false} scale={0.125} />
                <span style={{ minWidth: 0, flex: 1 }}>[{sinnerIdMapping[ego.sinnerId]}] {ego.name}</span>
            </div>,
            searchStrings: [ego.name, sinnerIdMapping[ego.sinnerId]]
        };
        return acc;
    }, {}), [egos, loading]);

    return <DropdownSelectorWithExclusion
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Search E.G.Os..."}
        filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.searchStrings)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={excludeMode}
    />;
}

export function EgoMenuSelector({ value, setValue, options, rank }) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);

    return <Select.Root value={value ? value.id : null} onValueChange={v => setValue(v)} open={isOpen} onOpenChange={setIsOpen}>
        <Select.Trigger className={styles.egoMenuSelectorTrigger} ref={triggerRef} style={{ borderColor: value ? affinityColorMapping[value.affinity] : "#555" }}>
            {value ? <div {...(isTouchDevice() ? {} : getEgoTooltipProps(value.id))}
                style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: "4/1" }}>
                <EgoIcon ego={value} banner={true} type={"awaken"} displayName={true} displayRarity={false} />
            </div> : <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RarityIcon rarity={egoRanks[rank]} alt={true} style={{ width: "18%", height: "auto" }} />
            </div>}
        </Select.Trigger>

        <Select.Portal>
            <Select.Content className={styles.egoMenuSelectorContent} position="popper" >
                {options.length === 0 ? <div style={{ fontSize: "1.2rem", padding: "0.5rem" }}>No Options</div> : null}
                <Select.Viewport>
                    <div className={styles.egoMenuSelectorGrid}>
                        {options.map((option) =>
                            <Select.Item key={option.id} value={option.id} className={styles.egoMenuSelectorItem}>
                                <div className={styles.egoMenuItemInner} {...getEgoTooltipProps(option.id)} >
                                    <EgoIcon ego={option} type={"awaken"} displayName={true} displayRarity={false} />
                                </div>
                            </Select.Item>
                        )}
                        {value ? <Select.Item key={"cancel"} value={null} className={styles.egoMenuSelectorItem}>
                            <div className={styles.egoMenuItemInner} style={{ height: "100%", width: "128px", justifyContent: "center", color: "#ff4848", fontSize: "3rem", fontWeight: "bold" }}>
                                ✕
                            </div>
                        </Select.Item> : null}
                    </div>
                    {options.length > 12 ? <div className={styles.egoMenuSelectorFadeBottom} > ▼ </div> : null}
                </Select.Viewport>
            </Select.Content>
        </Select.Portal>
    </Select.Root>;
}