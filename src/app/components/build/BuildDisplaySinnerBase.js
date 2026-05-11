"use client";

import DeploymentComponent from "./DeploymentComponent";
import EgoIcon from "../icons/EgoIcon";
import IdentityIcon from "../icons/IdentityIcon";
import RarityIcon from "../icons/RarityIcon";
import SinnerIcon from "../icons/SinnerIcon";
import LinkWithTooltip from "../LinkWithTooltip";
import { getEgoTooltipProps } from "../tooltips/EgoTooltip";
import { getIdentityTooltipProps } from "../tooltips/IdentityTooltip";

import { deploymentColors } from "@/app/lib/colors";
import { egoRanks } from "@/app/lib/constants";
import { getDeploymentPosition } from "@/app/lib/deploymentOrder";

function Identity({ identity, displayType, sinnerId, uptie, level }) {
    if (!identity)
        return <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SinnerIcon num={sinnerId} style={{ width: "75%", height: "75%" }} />
        </div>

    const props = { displayName: displayType === "names" || displayType === "ids", displayRarity: true };
    if (uptie) {
        props.uptie = uptie;
        props.displayUptie = true;
    } else {
        props.uptie = 4;
    }
    if (level) props.level = level;

    return displayType !== null ?
        (
            identity.upcoming ?
                <div style={{ position: "relative", width: "100%" }}>
                    <IdentityIcon identity={identity} {...props} />
                </div> :
                <LinkWithTooltip href={`/identities/${identity.id}`} tooltipProps={getIdentityTooltipProps(identity.id)}>
                    <div style={{ position: "relative", width: "100%" }}>
                        <IdentityIcon identity={identity} {...props} />
                    </div>
                </LinkWithTooltip>
        ) :
        <div style={{ width: "100%", aspectRatio: "1/1", boxSizing: "border-box" }} />
}

function Ego({ ego, displayType, rank, threadspin }) {
    let aspectRatio = displayType === "ego-comp" ? "1/1" : "4/1";

    if (!ego)
        return <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: aspectRatio }}>
            <RarityIcon rarity={egoRanks[rank]} alt={true} style={{ width: displayType === "ego-comp" ? "80%" : "18%", height: "auto" }} />
        </div>

    const props = { banner: displayType !== "ego-comp", type: "awaken", displayName: displayType === "names", displayRarity: false };
    let tooltipId = ego.id;
    if (threadspin && displayType !== "ego-comp") {
        props.threadspin = threadspin;
        tooltipId = `${tooltipId}|${threadspin}`;
    }

    return displayType !== null ?
        (
            ego.upcoming ?
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: aspectRatio }}>
                    <EgoIcon ego={ego} {...props} />
                </div> :
                <LinkWithTooltip href={`/egos/${ego.id}`} tooltipProps={getEgoTooltipProps(tooltipId)}>
                    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: aspectRatio }}>
                        <EgoIcon ego={ego} {...props} />
                    </div>
                </LinkWithTooltip>
        ) :
        <div style={{ width: "100%", aspectRatio: "4/1", boxSizing: "border-box" }} />
}

export default function BuildDisplaySinnerBase({ displayType, sinnerId, identity, egos, uptie, level, threadspins, deploymentOrder, activeSinners }) {
    const [depType, depIndex] = getDeploymentPosition(deploymentOrder, activeSinners, sinnerId);

    if (displayType === "ids")
        return <div style={{ display: "flex", flexDirection: "column", width: "100%", border: `1px ${deploymentColors[depType]} solid` }}>
            <Identity
                identity={identity}
                displayType={displayType}
                sinnerId={sinnerId}
                uptie={uptie}
                level={level}
            />
            <DeploymentComponent depType={depType} depIndex={depIndex} sinnerId={sinnerId} />
        </div>

    const columns = displayType === "ego-comp" ? "4fr 1fr" : "1fr 1fr";

    return <div style={{ display: "grid", gridTemplateColumns: columns, width: "100%", border: `1px ${deploymentColors[depType]} solid` }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
            <Identity
                identity={identity}
                displayType={displayType}
                sinnerId={sinnerId}
                uptie={uptie}
                level={level}
            />
            <DeploymentComponent depType={depType} depIndex={depIndex} sinnerId={sinnerId} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
            {Array.from({ length: 5 }, (_, rank) =>
                <Ego
                    key={rank}
                    ego={egos[rank]}
                    displayType={displayType}
                    rank={rank}
                    threadspin={threadspins?.[rank]}
                />)}
        </div>
    </div>
}
