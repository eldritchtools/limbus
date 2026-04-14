"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useState } from "react";

import Gift from "../gifts/Gift";
import ThemePackIcon from "../icons/ThemePackIcon";
import MarkdownEditorWrapper from "../markdown/MarkdownEditorWrapper";
import MarkdownRenderer from "../markdown/MarkdownRenderer";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { mdDiffculties } from "@/app/lib/mirrorDungeon";

function FloorItem({ floor, setFloor, difficulty, index, isFirst, isLast, swapFloors, removeFloor, addThemePacks, removeThemePacks, addFloorGifts, removeFloorGifts, hideDescriptions, editable }) {
    const { isMobile } = useBreakpoint();

    const packScale = isMobile ? .4 : (floor.themePacks.length === 1 ? .44 : .3)

    const labelComponent = editable ?
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span>Floor Set:</span>
            <select value={floor.floorSet} onChange={e => { setFloor({ floorSet: e.target.value, themePacks: [], gifts: [] }) }}>
                {mdDiffculties[difficulty].floorSets.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <span>Floor Label:</span>
            <input value={floor.label} onChange={e => setFloor({ label: e.target.value })} />
        </div> :
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "1.2rem" }}>
            Floor: {floor.label.length > 0 ? floor.label : floor.floorSet}
        </div>

    const orderComponent = editable ?
        <div style={{
            display: "flex", flexDirection: hideDescriptions ? "row" : "column",
            gap: hideDescriptions ? "0.2rem" : "2rem", paddingRight: isMobile ? "0.1rem" : "1rem"
        }}>
            <button onClick={() => swapFloors(index - 1)} disabled={isFirst}>{hideDescriptions ? "<" : "∧"}</button>
            <button onClick={() => removeFloor()}>
                <div style={{ color: "#ff4848", fontWeight: "bold" }}>
                    ✕
                </div>
            </button>
            <button onClick={() => swapFloors(index + 1)} disabled={isLast}>{hideDescriptions ? ">" : "∨"}</button>
        </div> :
        null

    const themePacksComponent = <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", width: isMobile ? "160px" : "300px", height: "350px",
        border: "1px #aaa solid", borderRadius: "1rem", padding: "0.5rem", boxSizing: "border-box"
    }}>
        <h3 style={{ margin: 0 }}>Theme Packs</h3>
        {editable ?
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 80px)" }}>
                <button onClick={() => addThemePacks()}>Add</button>
                <button onClick={() => removeThemePacks()}>Remove</button>
            </div> :
            null
        }
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", width: "100%", overflowY: "auto", overflowX: "hidden" }}>
            {floor.themePacks.map(pack =>
                <ThemePackIcon key={pack} id={pack} displayName={true} scale={packScale} />
            )}
        </div>
    </div>;

    const giftsComponent = <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", width: isMobile ? "160px" : "300px", height: "350px",
        border: "1px #aaa solid", borderRadius: "1rem", padding: "0.5rem", boxSizing: "border-box"
    }}>
        <h3 style={{ margin: 0 }}>Gifts</h3>
        {editable ?
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 80px)" }}>
                <button onClick={() => addFloorGifts()}>Add</button>
                <button onClick={() => removeFloorGifts()}>Remove</button>
            </div> :
            null
        }
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", overflowY: "auto" }}>
            {floor.gifts.map(gift =>
                <Gift key={gift} id={gift} scale={isMobile ? 0.6 : 0.9} />
            )}
        </div>
    </div>

    const noteComponent = editable ?
        <div style={{ minWidth: "min(80ch, 90vw)" }}>
            <MarkdownEditorWrapper
                value={floor.note}
                onChange={x => setFloor({ note: x })}
                placeholder={"Add any notes for this floor here..."}
            />
        </div> :
        <div style={!isMobile ? { alignSelf: "start", flex: "1 1 600px", minWidth: "600px" } : {}}>
            <MarkdownRenderer content={floor.note} />
        </div>


    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {hideDescriptions ? orderComponent : null}
            {labelComponent}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "0.1rem" : "0.5rem", alignItems: "start", width: "100%" }}>
            {!hideDescriptions ? <div style={{ alignSelf: "center" }}>{orderComponent}</div> : null}
            {themePacksComponent}
            {giftsComponent}
            {!isMobile && !hideDescriptions ? noteComponent : null}
        </div>
        {isMobile && !hideDescriptions ? noteComponent : null}
    </div>
}

export default function FloorPlan({ difficulty, floors, setFloors, addThemePacks, removeThemePacks, addFloorGifts, removeFloorGifts, editable = false }) {
    const [nextKey, setNextKey] = useState(0);
    const [hideDescriptions, setHideDescriptions] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNextKey(Math.max(0, ...floors.map(x => x.key)) + 1);
    }, [floors]);

    // if (!editable)
    //     return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
    //         {floors.map((floor, i) => <FloorItem key={i} floor={floor} editable={editable} />)}
    //     </div>

    const swapFloors = (a, b) => {
        setFloors(p => {
            const res = [...p];
            [res[a], res[b]] = [res[b], res[a]];
            return res;
        });
    };

    const addFloor = () => {
        setFloors(p => [...p, {
            key: nextKey,
            floorSet: "1",
            label: "",
            themePacks: [],
            gifts: [],
            note: ""
        }])
        setNextKey(p => p + 1);
    };

    const removeFloor = (index) => {
        setFloors(p => p.filter((x, i) => i !== index));
    };

    const setFloor = (index, params) => {
        setFloors(p => p.map((x, i) => i === index ? { ...x, ...params } : x));
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {editable ? <button onClick={() => addFloor()}>Add Floor</button> : null}
            <label>
                <input type="checkbox" checked={hideDescriptions} onChange={e => setHideDescriptions(e.target.checked)} />
                <span {...getGeneralTooltipProps("This will hide floor descriptions, allowing you to see the floor plan in a more compact manner.")}
                    style={{ borderBottom: "1px #aaa dotted", cursor: "help" }}
                >
                    Hide Floor Descriptions
                </span>
            </label>
        </div>
        <div style={{ display: "flex", flexDirection: hideDescriptions ? "row" : "column", flexWrap: hideDescriptions ? "wrap" : null, gap: "0.5rem" }}>
            {floors.map((floor, i) =>
                <FloorItem
                    key={floor.key}
                    floor={floor}
                    setFloor={p => setFloor(i, p)}
                    difficulty={difficulty}
                    index={i}
                    isFirst={i === 0}
                    isLast={i === floors.length - 1}
                    swapFloors={x => swapFloors(i, x)}
                    removeFloor={() => removeFloor(i)}
                    addThemePacks={() => addThemePacks(i)}
                    removeThemePacks={() => removeThemePacks(i)}
                    addFloorGifts={() => addFloorGifts(i)}
                    removeFloorGifts={() => removeFloorGifts(i)}
                    hideDescriptions={hideDescriptions}
                    editable={editable}
                />
            )}
        </div>
    </div>
}
