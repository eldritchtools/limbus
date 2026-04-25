"use client";

import { useMemo } from "react";

import { useData } from "../DataProvider";
import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";
import AdditionalIcon from "../icons/AdditionalIcon";

import { checkFilterMatch, normalizeString } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";

export function AdditionalIconDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle, excludeMode }) {
    const [icons, loading] = useData("additional_icons");

    const optionsMapped = useMemo(() => loading ? [] : Object.entries(icons).reduce((acc, [id, name]) => {
        acc[id] = {
            value: id,
            label: <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}><AdditionalIcon id={id} style={{ height: "2rem" }} />{name}</span>,
            name: name
        }
        return acc;
    }, {}), [icons, loading]);

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
        placeholder={"Search Icons..."}
        filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={excludeMode}
    />;
}