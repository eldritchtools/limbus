"use client";

import { useMemo } from "react";

import { useData } from "../DataProvider";
import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";
import Status from "../objects/Status";

import { checkFilterMatch, normalizeString } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";

export function StatusDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle, options, excludeMode }) {
    const [statuses, loading] = useData("statuses");

    const optionsMapped = useMemo(() => loading ? [] :
        (options ?? Object.keys(statuses)).reduce((acc, id) => {
            acc[id] = {
                value: id,
                label: <Status status={statuses[id]} includeTooltip={true} />,
                name: statuses[id].name
            };
            return acc;
        }, {}),
        [statuses, options, loading]
    );

    const optionsSorted = useMemo(() =>
        Object.values(optionsMapped).sort((a, b) =>
            normalizeString(a.name).localeCompare(normalizeString(b.name))
        ),
        [optionsMapped]
    );

    return <DropdownSelectorWithExclusion
        options={optionsSorted}
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Search Statuses..."}
        filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={excludeMode}
    />;
}