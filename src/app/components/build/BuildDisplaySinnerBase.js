import EgoIcon from "../icons/EgoIcon";
import IdentityIcon from "../icons/IdentityIcon";
import RarityIcon from "../icons/RarityIcon";
import SinnerIcon from "../icons/SinnerIcon";
import LinkWithTooltip from "../LinkWithTooltip";
import { getEgoTooltipProps } from "../tooltips/EgoTooltip";
import { getIdentityTooltipProps } from "../tooltips/IdentityTooltip";

function Identity({ identity, displayType, sinnerId, uptie, level }) {
    if (!identity)
        return <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SinnerIcon num={sinnerId} style={{ width: "75%" }} />
        </div>

    const props = { displayName: displayType === "names", displayRarity: true };
    if (uptie) {
        props.uptie = uptie;
        props.displayUptie = true;
    } else {
        props.uptie = 4;
    }
    if (level) props.level = level;

    return displayType !== null ?
        <LinkWithTooltip href={`/identities/${identity.id}`} tooltipProps={getIdentityTooltipProps(identity.id)}>
            <div style={{ position: "relative", width: "100%" }}>
                <IdentityIcon identity={identity} {...props} />
            </div>
        </LinkWithTooltip> :
        <div style={{ width: "100%", aspectRatio: "1/1", boxSizing: "border-box" }} />
}

const egoRankReverseMapping = {
    0: "zayin",
    1: "teth",
    2: "he",
    3: "waw",
    4: "aleph"
}

function Ego({ ego, displayType, rank, threadspin }) {
    if (!ego)
        return <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: "4/1" }}>
            <RarityIcon rarity={egoRankReverseMapping[rank]} alt={true} style={{ width: "18%", height: "auto" }} />
        </div>

    const props = { banner: true, type: "awaken", displayName: displayType === "names", displayRarity: false };
    let tooltipId = ego.id;
    if (threadspin) {
        props.threadspin = threadspin;
        tooltipId = `${tooltipId}|${threadspin}`;
    }

    return displayType !== null ?
        <LinkWithTooltip href={`/egos/${ego.id}`} tooltipProps={getEgoTooltipProps(tooltipId)}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: "4/1" }}>
                <EgoIcon ego={ego} {...props} />
            </div>
        </LinkWithTooltip> :
        <div style={{ width: "100%", aspectRatio: "4/1", boxSizing: "border-box" }} />
}

const deploymentComponentStyle = {
    flex: 1,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    containerType: "size",
    fontSize: "clamp(0.6rem, 20cqw, 1.5rem)"
}

function DeploymentComponent({ order, activeSinners, sinnerId }) {
    const index = order.findIndex(x => x === sinnerId);
    if (index === -1) {
        return <div style={deploymentComponentStyle} />
    } else if (index < activeSinners) {
        return <div style={deploymentComponentStyle}>
            <span style={{ color: "#fefe3d" }}>Active {index + 1}</span>
        </div>
    } else {
        return <div style={deploymentComponentStyle}>
            <span style={{ color: "#29fee9" }}>Backup {index + 1}</span>
        </div>
    }
}

export default function BuildDisplaySinnerBase({ displayType, sinnerId, identity, egos, uptie, level, threadspins, deploymentOrder, activeSinners }) {
    return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", border: "1px #444 solid" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
            <Identity
                identity={identity}
                displayType={displayType}
                sinnerId={sinnerId}
                uptie={uptie}
                level={level}
            />
            <DeploymentComponent order={deploymentOrder} activeSinners={activeSinners} sinnerId={sinnerId} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
            {Array.from({ length: 5 }, (_, rank) =>
                <Ego
                    key={rank}
                    ego={egos}
                    displayType={displayType}
                    rank={rank}
                    threadspin={threadspins}
                />)}
        </div>
    </div>
}
