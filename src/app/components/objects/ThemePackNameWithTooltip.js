import { useData } from "../DataProvider";
import { getThemePackTooltipProps } from "../tooltips/ThemePackTooltip";

function ThemePackNameWithTooltipMain({ id, themePack = null, style = {} }) {
    const defaultStyle = { borderBottom: "1px dotted var(--primary-border-color)", cursor: "help" };

    return <span {...getThemePackTooltipProps(id)} style={{ ...defaultStyle, ...style }}>
        {themePack.name}
    </span>;
}

function ThemePackNameWithTooltipFetch({ id, ...props }) {
    const [themePacksData, themePacksLoading] = useData("md_theme_packs");

    if (themePacksLoading) return null;

    if (!(id in themePacksData)) {
        console.warn(`Theme Pack ${id} not found`);
        return null;
    }

    return <ThemePackNameWithTooltipMain id={id} themePack={themePacksData[id]} {...props} />
}

export default function ThemePackNameWithTooltip({ id, themePack = null, ...props }) {
    if (themePack) {
        return <ThemePackNameWithTooltipMain id={id ?? themePack?.id} themePack={themePack} {...props} />
    } else {
        return <ThemePackNameWithTooltipFetch id={id} {...props} />
    }
}
