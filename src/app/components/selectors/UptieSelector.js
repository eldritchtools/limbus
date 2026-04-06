"use client";

import * as Select from "@radix-ui/react-select";
import { useRef, useState } from "react";

import styles from "./UptieSelector.module.css";
import TierIcon from "../icons/TierIcon";

function UptieSelector({ value, setValue, allowEmpty = false, emptyIcon = null, bottomOption = null }) {
    const [isOpen, setIsOpen] = useState(false);

    const triggerRef = useRef(null);

    const handleUpdateValue = (updatedValue) => {
        if (!updatedValue) setValue("");
        else setValue(updatedValue);
    }

    return <Select.Root value={value} onValueChange={handleUpdateValue} open={isOpen} onOpenChange={setIsOpen}>
        <Select.Trigger className={styles.uptieSelectorTrigger} ref={triggerRef}>
            {value || !emptyIcon ?
                <TierIcon tier={value} scaleY={1.2} /> :
                emptyIcon
            }
        </Select.Trigger>

        <Select.Portal>
            <Select.Content className={styles.uptieSelectorContent} style={{ width: allowEmpty ? "12.5rem" : "10rem" }} position="popper">
                <Select.Viewport>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div className={styles.uptieSelectorGrid} style={{ gridTemplateColumns: `repeat(${allowEmpty ? 5 : 4}, 1fr)` }}>
                            {[1, 2, 3, 4].map((option) =>
                                <Select.Item key={option} value={option} className={styles.uptieSelectorItem}>
                                    <div className={styles.uptieItemInner}>
                                        <TierIcon tier={option} scaleY={1.2} />
                                    </div>
                                </Select.Item>
                            )}
                            {allowEmpty ? <Select.Item key={"cancel"} value={null} className={styles.uptieSelectorItem}>
                                <div className={styles.uptieItemInner} style={{ height: "1.5rem", justifyContent: "center", color: "#ff4848", fontSize: "1rem", fontWeight: "bold" }}>
                                    ✕
                                </div>
                            </Select.Item> : null}
                        </div>
                        {
                            bottomOption ? <Select.Item key={bottomOption} value={bottomOption} className={styles.uptieSelectorItem}>
                                {bottomOption}
                            </Select.Item> : null
                        }
                    </div>
                </Select.Viewport>
            </Select.Content>
        </Select.Portal>
    </Select.Root>
}

export default UptieSelector;