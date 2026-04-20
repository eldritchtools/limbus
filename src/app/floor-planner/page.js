"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import * as Select from "@radix-ui/react-select";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import styles from "./floorPlanner.module.css";
import { useData } from "../components/DataProvider";
import Gift from "../components/gifts/Gift";
import ThemePackIcon from "../components/icons/ThemePackIcon";
import NoPrefetchLink from "../components/NoPrefetchLink";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import useLocalState from "../lib/useLocalState";

function FloorSelector({ value, setValue, options, isSmall }) {
    const [isOpen, setIsOpen] = useState(false);

    const triggerRef = useRef(null);

    const sizeStyle = isSmall ? { width: "125px", height: "240px" } : { width: "200px", height: "350px" };

    return <Select.Root value={value} onValueChange={x => setValue(x)} open={isOpen} onOpenChange={setIsOpen}>
        <Select.Trigger className={styles.floorSelectTrigger} ref={triggerRef} style={sizeStyle}>
            {value ? <ThemePackIcon id={value} displayName={true} scale={isSmall ? .3 : 0.45} /> : null}
        </Select.Trigger>

        <Select.Content className={styles.floorSelectContent} position="popper">
            <Select.Viewport>
                <div className={styles.floorSelectGrid}>
                    {options.map((option) =>
                        <Select.Item key={option} value={option} className={styles.floorSelectItem}>
                            <div className={styles.floorItemInner}>
                                <ThemePackIcon id={option} displayName={true} scale={isSmall ? .15 : 0.25} />
                            </div>
                        </Select.Item>
                    )}
                    {value ? <Select.Item key={"cancel"} value={null} className={styles.floorSelectItem}>
                        <div className={styles.floorItemInner} style={{
                            height: "100%", justifyContent: "center",
                            color: "#ff4848", fontSize: "3rem", fontWeight: "bold"
                        }}>
                            ✕
                        </div>
                    </Select.Item> : null}
                </div>
                {options.length > 10 ? <div className={styles.floorSelectFadeBottom} > ▼ </div> : null}
            </Select.Viewport>
        </Select.Content>
    </Select.Root>;
}

export default function FloorPlannerPage() {
    const [themePacks, themePacksLoading] = useData("md_theme_packs");
    const [floorPacks, floorPacksLoading] = useData("md_floor_packs");
    const { isDesktop } = useBreakpoint();

    const [selectedFloors, setSelectedFloors] = useLocalState("floorPlannerFloors", new Array(15).fill(null));
    const [difficulty, setDifficulty] = useLocalState("floorPlannerDifficulty", "E");
    const router = useRouter();

    const handleSetDifficulty = v => {
        if (difficulty === "N" || v === "N") setSelectedFloors(new Array(15).fill(null));
        setDifficulty(v);
    }

    const clear = () => {
        setSelectedFloors(new Array(15).fill(null));
    }

    const copyToMdPlan = () => {
        const params = new URLSearchParams({ difficulty, floors: selectedFloors });
        router.push(`/md-plans/new?${params.toString()}`)
    }

    const setSelectedFloor = (value, index) => {
        setSelectedFloors(selectedFloors.map((f, i) => i === index ? value : f));
    }

    const getOptions = floor => {
        let options = [];
        if (floor <= 5) {
            if (difficulty === "N") options = floorPacks.normal[floor];
            else options = floorPacks.hard[floor];
        } else if (floor <= 10) {
            options = floorPacks.hard["6-10"];
        } else {
            options = floorPacks.hard["11-15"];
        }
        return options.filter(pack => !selectedFloors.includes(pack));
    }

    const floors = difficulty === "E" ? 15 : (difficulty === "I" ? 10 : 5);
    const size = isDesktop ? "400px" : "330px";

    if (themePacksLoading || floorPacksLoading) return <LoadingContentPageTemplate />;

    return <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "center", width: "100%" }}>
        <h2 style={{ margin: 0 }}>Floor Planner</h2>
        <span style={{maxWidth: "1000px", textAlign: "center"}}>This tool is made to be used as a quick way to view and plan theme pack options per floor. If you want to create and share a floor plan, please create an <NoPrefetchLink className="text-link" href="/md-plans/new">MD Plan</NoPrefetchLink> instead. You can also copy a floor plan you made here into an MD Plan using the button below.</span>
        <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
            <label>
                <span {...getGeneralTooltipProps("Changing to or from Normal will reset all selected theme packs.")}
                    style={{ marginRight: "0.2rem", borderBottom: "1px #aaa dotted" }}>
                    Select Difficulty:
                </span>
                <select name="difficulty" id="difficulty" value={difficulty} onChange={e => handleSetDifficulty(e.target.value)}>
                    <option value="N">Normal</option>
                    <option value="H">Hard</option>
                    <option value="I">Infinity</option>
                    <option value="E">Extreme</option>
                </select>
            </label>
            <button onClick={clear}>Clear</button>
            <button onClick={copyToMdPlan}>Copy to MD Plan</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, ${size})`, justifyContent: "center", width: "100%", gap: "0.5rem" }}>
            {Array.from({ length: floors }).map((_, index) =>
                <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr auto", width: size }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span>Floor {index + 1}</span>
                        {
                            selectedFloors[index] && "exclusive_gifts" in themePacks[selectedFloors[index]] ?
                                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                                    {themePacks[selectedFloors[index]].exclusive_gifts.map(giftId =>
                                        <Gift key={giftId} id={giftId} includeTooltip={true} scale={isDesktop ? .66 : .5} />
                                    )}
                                </div> :
                                null
                        }
                    </div>
                    <FloorSelector
                        value={selectedFloors[index]}
                        setValue={v => setSelectedFloor(v, index)}
                        options={getOptions(index + 1)}
                        isSmall={!isDesktop}
                    />
                </div>
            )}
        </div>
    </div>;
}