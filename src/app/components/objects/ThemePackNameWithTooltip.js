import { useData } from "../DataProvider";
import { getThemePackTooltipProps } from "../tooltips/ThemePackTooltip";

export default function ThemePackNameWithTooltip({ id, style = {} }) {
    const [themePacksData, themePacksLoading] = useData("md_theme_packs");
    if (themePacksLoading) return null;

    const defaultStyle = { borderBottom: "1px dotted #aaa", cursor: "help" };
    const themePack = themePacksData[id];

    return <span {...getThemePackTooltipProps(id)} style={{ ...defaultStyle, ...style }}>
        {themePack.name}
    </span>;
}
