"use client";

import * as Select from "@radix-ui/react-select";
import { useMemo, useRef, useState } from "react";

import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";
import styles from "./SinnerSelectors.module.css";
import SinnerIcon from "../icons/SinnerIcon";

import { sinnerIdMapping } from "@/app/lib/constants";
import { checkFilterMatch } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";

export function SinnerDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle }) {
    const optionsMapped = useMemo(() => Object.entries(sinnerIdMapping).reduce((acc, [id, sinner]) => {
        acc[id] = {
            value: id,
            label: sinner,
            name: sinner
        };
        return acc;
    }, {}), []);

    return <DropdownSelectorWithExclusion
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Search Sinner..."}
        filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={false}
    />;
}

export function SinnerMenuSelector({ value, setValue }) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);

    const handleUpdateValue = (updatedValue) => {
        if (!updatedValue) setValue("");
        else setValue(updatedValue);
    }

    return <Select.Root value={value} onValueChange={handleUpdateValue} open={isOpen} onOpenChange={setIsOpen}>
        <Select.Trigger className={`${styles.sinnerSelectorTrigger}`} ref={triggerRef}>
            {value && <SinnerIcon num={value} style={{ width: "2rem", height: "2rem" }} />}
        </Select.Trigger>

        <Select.Portal>
            <Select.Content className={styles.sinnerSelectorContent} position="popper">
                <Select.Viewport>
                    <div className={styles.sinnerSelectorGrid}>
                        {Array.from({ length: 12 }, (x, i) => i + 1).map((option) =>
                            <Select.Item key={option} value={option} className={styles.sinnerSelectorItem}>
                                <div className={styles.sinnerItemInner}>
                                    <SinnerIcon num={option} style={{ width: "2rem", height: "2rem" }} />
                                </div>
                            </Select.Item>
                        )}
                    </div>
                </Select.Viewport>
            </Select.Content>
        </Select.Portal>
    </Select.Root>
}
