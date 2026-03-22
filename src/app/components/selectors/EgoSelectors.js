import { useMemo } from "react";

import { useData } from "../DataProvider";
import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";
import EgoIcon from "../icons/EgoIcon";

import { sinnerIdMapping } from "@/app/lib/constants";
import { checkFilterMatch } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";

export function EgoDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle, excludeMode }) {
    const [egos, loading] = useData("egos_mini");

    const optionsMapped = useMemo(() => loading ? [] : Object.entries(egos).reduce((acc, [id, ego]) => {
        acc[id] = {
            value: ego.id,
            label: <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", maxWidth: "65vw" }}>
                <EgoIcon id={ego.id} type={"awaken"} displayName={false} scale={0.125} />
                <span>[{sinnerIdMapping[ego.sinnerId]}] {ego.name}</span>
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