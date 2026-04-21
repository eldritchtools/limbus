import { useData } from "../DataProvider";
import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";
import ThemePackIcon from "../icons/ThemePackIcon";

import { checkFilterMatch } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";


export function ThemePackDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle, excludeMode, options, prefixCategory = false }) {
    const [themePacks, loading] = useData("md_theme_packs");

    const [optionsFinal, optionsMapped] = useMemo(() => {
        if (loading) return [[], {}];
        const list = [];
        const mapped = {};
        (options ?? Object.keys(themePacks)).forEach(id => {
            const name = prefixCategory ? `${themePacks[id].category[0]}: ${themePacks[id].name}` : themePacks[id].name;
            list.push({
                value: id,
                label: <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ThemePackIcon id={id} scale={.1} />
                    <span>{name}</span>
                </div>,
                name: name
            })
            mapped[id] = {
                value: id,
                label: <div style={{ display: "flex", alignItems: "center" }}>
                    <span>{name}</span>
                </div>
            }
        });
        return [list, mapped];
    }, [options, prefixCategory, themePacks, loading]);

    return <DropdownSelectorWithExclusion
        options={optionsFinal}
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Select Theme Packs..."}
        filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={excludeMode}
    />;
}
