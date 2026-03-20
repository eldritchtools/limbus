import { Tooltip } from "react-tooltip";

const style = {
    outlineStyle: "solid",
    outlineColor: "#ddd",
    outlineWidth: "1px",
    backgroundColor: "#000000",
    borderRadius: "1rem",
    zIndex: "9999",
    maxWidth: "min(90vw, 800px)"
};

export default function TooltipTemplate({ id, contentFunc }) {
    return <Tooltip
        id={id}
        render={({ content }) => <div style={style}>{contentFunc(content)}</div>}
        getTooltipContainer={() => document.body}
        style={{ backgroundColor: "transparent", zIndex: "9999" }}
    />
}