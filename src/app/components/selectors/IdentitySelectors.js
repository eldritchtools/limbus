import { useMemo } from "react";

import { useData } from "../DataProvider";
import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";
import IdentityIcon from "../icons/IdentityIcon";

import { sinnerIdMapping } from "@/app/lib/constants";
import { checkFilterMatch } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";

export function IdentityDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle, excludeMode }) {
    const [identities, loading] = useData("identities_mini");

    const optionsMapped = useMemo(() => loading ? {} : Object.entries(identities).reduce((acc, [id, identity]) => {
        acc[id] = {
            value: identity.id,
            label: <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", maxWidth: "65vw" }}>
                <IdentityIcon id={identity.id} uptie={4} displayName={false} scale={0.125} />
                <span>[{sinnerIdMapping[identity.sinnerId]}] {identity.name}</span>
            </div>,
            searchStrings: [identity.name, sinnerIdMapping[identity.sinnerId]]
        };
        return acc;
    }, {}), [identities, loading]);

    return <DropdownSelectorWithExclusion
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Search Identities..."}
        filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.searchStrings)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={excludeMode}
    />;
}