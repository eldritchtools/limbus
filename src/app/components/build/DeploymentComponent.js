import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { deploymentColors } from "@/app/lib/colors";

const deploymentComponentStyle = {
    flex: 1,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    margin: 0,
    width: "100%",
    aspectRatio: "4/1",
    containerType: "size",
    borderRadius: "0.5rem"
}

const innerStyle = {
    fontSize: "clamp(0.6rem, 15cqw, 1.5rem)"
}

const generalProps = getGeneralTooltipProps("Try the Easy Deployment Menu if you need to rearrange sinners.")

export default function DeploymentComponent({ depType, depIndex, setOrder, sinnerId }) {
    if (depType === "none") {
        if (setOrder)
            return <button onClick={() => setOrder(p => [...p, sinnerId])} style={deploymentComponentStyle} {...generalProps}>
                <span style={innerStyle}>Deploy</span>
            </button>;
        else
            return <div style={deploymentComponentStyle} />;
    } else if (depType === "active") {
        if (setOrder)
            return <button onClick={() => setOrder(p => p.filter(x => x !== sinnerId))} style={deploymentComponentStyle} {...generalProps}>
                <span style={{ ...innerStyle, color: deploymentColors.active }}>Active {depIndex}</span>
            </button>;
        else
            return <div style={deploymentComponentStyle}>
                <span style={{ ...innerStyle, color: deploymentColors.active }}>Active {depIndex}</span>
            </div>;
    } else if (depType === "backup") {
        if (setOrder)
            return <button onClick={() => setOrder(p => p.filter(x => x !== sinnerId))} style={deploymentComponentStyle} {...generalProps}>
                <span style={{ ...innerStyle, color: deploymentColors.backup }}>Backup {depIndex}</span>
            </button>;
        else
            return <div style={deploymentComponentStyle}>
                <span style={{ ...innerStyle, color: deploymentColors.backup }}>Backup {depIndex}</span>
            </div>
    } else {
        return null;
    }
}
