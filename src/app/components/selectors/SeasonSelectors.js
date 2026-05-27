"use client";

import { useMemo } from "react";

import { useData } from "../DataProvider";
import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";

import { getSeasonString } from "@/app/lib/constants";
import { checkFilterMatch } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";

export function SeasonDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle, options, excludeMode }) {
    const [identities, loading] = useData("identities", options === undefined);

    const optionsMapped = useMemo(() => {
        if (!options && loading) return [];

        const seasonListToOptions = list => list.reduce((acc, season) => {
            acc[season] = {
                value: season,
                label: season === 9100 ? "Walpurgisnacht (any)" : getSeasonString(season),
                name: season === 9100 ? "Walpurgisnacht" : getSeasonString(season)
            }
            return acc;
        }, {});

        if (options) return seasonListToOptions(options);

        const seasons = new Set();
        seasons.add(9100);
        Object.values(identities).forEach(identity => seasons.add(identity.season));
        return seasonListToOptions([...seasons])
    },
        [identities, options, loading]
    );

    const optionsSorted = useMemo(() =>
        Object.values(optionsMapped).sort((a, b) => a.value - b.value),
        [optionsMapped]
    );
    
    return <DropdownSelectorWithExclusion
        options={optionsSorted}
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Search Seasons..."}
        filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={excludeMode}
    />;
}
