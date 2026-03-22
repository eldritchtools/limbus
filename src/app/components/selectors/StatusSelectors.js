import { useMemo } from "react";

import { useData } from "../DataProvider";
import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";
import Status from "../objects/Status";

import { checkFilterMatch, normalizeString } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";

export function StatusDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle, excludeMode }) {
    const [statuses, loading] = useData("statuses");

    const optionsMapped = useMemo(() => loading ? [] : Object.entries(statuses).reduce((acc, [id, status]) => {
        acc[id] = {
            value: id,
            label: <Status status={status} includeTooltip={true} />,
            name: status.name
        };
        return acc;
    }, {}), [statuses, loading]);

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