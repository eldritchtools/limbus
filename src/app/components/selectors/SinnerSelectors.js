"use client";

import { useMemo } from "react";

import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";

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