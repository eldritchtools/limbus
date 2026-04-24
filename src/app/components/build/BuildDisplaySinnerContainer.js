"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";

import BuildDisplaySinnerBase from "./BuildDisplaySinnerBase";
import Icon from "../icons/Icon";
import KeywordIcon from "../icons/KeywordIcon";
import { EgoSkillCalc, IdentitySkillCalc } from "../skill/SkillCalc";
import { EgoSkillSummary, IdentitySkillSummary } from "../skill/SkillSummary";

import { ColoredResistance } from "@/app/lib/colors";
import { constructDefenseLevel, constructHp, constructSpeed } from "@/app/lib/identity";

function OverlayBase({ behind, content, blockAccess = false }) {
    return <div style={{ position: "relative", width: "100%", aspectRatio: "40 / 25", overflow: "hidden", borderRadius: "inherit" }}>
        {behind}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.75)", pointerEvents: blockAccess ? null : "none" }}>
            {content}
        </div>
    </div>
}

function StatsOverlay({ identity, uptie, level }) {
    const { isDesktop } = useBreakpoint();
    if (!identity) return null;

    const constructIconText = (icon, text) => {
        if (isDesktop) {
            return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                <Icon path={icon} style={{ width: "32px", height: "32px" }} />
                <span>{text}</span>
            </div>
        } else {
            return <div style={{ position: "relative", display: "flex", justifyContent: "center", width: "100%" }}>
                <Icon path={icon} style={{ width: "32px", height: "32px" }} />
                <span style={{
                    position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", textAlign: "center",
                    fontSize: "1rem", fontWeight: "bold", background: "rgba(0, 0, 0, 0.2)", color: "rgba(255, 255, 255, 0.8)"
                }}>{text}</span>
            </div>
        }
    }

    return <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", gap: "0.2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr 2fr" }}>
            {constructIconText("hp", constructHp(identity, level))}
            {constructIconText("speed", constructSpeed(identity, uptie))}
            {constructIconText("defense level", constructDefenseLevel(identity, level))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", textAlign: "center" }}>
            {constructIconText("Slash", <ColoredResistance resist={identity.resists.slash} />)}
            {constructIconText("Pierce", <ColoredResistance resist={identity.resists.pierce} />)}
            {constructIconText("Blunt", <ColoredResistance resist={identity.resists.blunt} />)}
        </div>

        <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
            {identity.skillKeywordList.map(x => <KeywordIcon key={x} id={x} />)}
        </div>
    </div>;
}

function SkillTypes({ skillType, uptie }) {
    const showAffinity = !uptie || !("affinityUptie" in skillType) || uptie >= skillType.affinityUptie;

    return <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.2rem", width: "100%", height: "100%", justifyContent: "center" }}>
        {showAffinity ? <KeywordIcon id={skillType.affinity} style={{ width: "25%", height: "100%" }} /> : null}
        <KeywordIcon id={skillType.type} style={{ width: "25%", height: "100%" }} />
        {skillType.type === "counter" ? <KeywordIcon id={skillType.atkType} style={{ width: "25%", height: "100%" }} /> : null}
    </div>
}

function TypesOverlay({ identity, egos, uptie }) {
    return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ display: "grid", gridTemplateRows: "repeat(5, 1fr)" }}>
            {identity ? <>
                {[0, 1, 2].map(x =>
                    <div key={x} style={{ display: "flex", justifyContent: "center" }}>
                        <SkillTypes skillType={identity.skillTypes[x].type} />
                    </div>
                )}
                {<SkillTypes key={3} skillType={identity.defenseSkillTypes[0].type} uptie={uptie} />}
            </> : null}
        </div>
        <div style={{ display: "grid", gridTemplateRows: "repeat(5, 1fr)" }}>
            {egos.map((ego, i) =>
                <div key={i} style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
                    {ego ? <SkillTypes skillType={ego.awakeningType} /> : null}
                </div>
            )}
        </div>
    </div>
}

function EgoStatsOverlay({ egos, displayType }) {
    const affinities = ["wrath", "lust", "sloth", "gluttony", "gloom", "pride", "envy"];
    const overlayStyle = { fontSize: "clamp(0.8rem, 50cqh, 1rem)", position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", background: "rgba(0, 0, 0, 0.2)" };
    const size = "clamp(1px, 100cqh, 32px)";

    return <div style={{ display: "grid", gridTemplateRows: "repeat(5, 1fr)", width: "100%", height: "20%", containerType: "size" }}>
        {egos.map((ego, i) => {
            if (!ego) return <div key={i} style={{ height: "100cqh" }} />;

            if (displayType === "egocosts")
                return <div key={i} style={{
                    display: "grid", gridTemplateColumns: `repeat(${Object.keys(ego.cost).length}, min(36px, 100cqh))`,
                    width: "100%", height: "100cqh", gap: "0.2rem", justifyContent: "center"
                }}>
                    {Object.entries(ego.cost).map(([affinity, cost]) =>
                        <div key={affinity} style={{ position: "relative", display: "flex", justifyContent: "center", width: "100%", containerType: "size" }}>
                            <KeywordIcon id={affinity} style={{ width: size, height: size }} />
                            <span style={overlayStyle}>x{cost}</span>
                        </div>)}
                </div>

            if (displayType === "egoresists")
                return <div key={i} style={{
                    display: "grid", gridTemplateColumns: "repeat(7, min(36px, 100cqh))",
                    width: "100%", height: "100cqh", gap: "0.2rem", justifyContent: "center"
                }}>
                    {affinities.map(affinity =>
                        <div key={affinity} style={{ position: "relative", display: "flex", justifyContent: "center", width: "100%", containerType: "size" }}>
                            <KeywordIcon id={affinity} style={{ width: size, height: size }} />
                            <span style={overlayStyle}><ColoredResistance resist={ego.resists[affinity]} /></span>
                        </div>)}
                </div>

            return <div key={i} style={{ height: "100cqh" }} />;
        }
        )}
    </div>
}

export default function BuildDisplaySinnerContainer({ displayType, sinnerId, identity, egos, identityLevel, egoThreadspins, identityUptie, deploymentOrder, activeSinners, otherOpts }) {
    const baseComponent = <BuildDisplaySinnerBase
        displayType={displayType}
        sinnerId={sinnerId}
        identity={identity}
        egos={egos}
        uptie={identityUptie}
        level={identityLevel}
        threadspins={egoThreadspins}
        deploymentOrder={deploymentOrder}
        activeSinners={activeSinners}
    />

    if (["names", "icons"].includes(displayType)) return baseComponent;

    const identityData = identity?.upcoming ? null : identity;
    const egosData = egos.map(x => x?.upcoming ? null : x);

    if (displayType === "stats") {
        return <OverlayBase
            behind={baseComponent}
            content={identityData ? <StatsOverlay identity={identityData} uptie={identityUptie} level={identityLevel} /> : null}
        />
    }

    if (displayType === "types") {
        return <OverlayBase
            behind={baseComponent}
            content={identityData ? <TypesOverlay identity={identityData} egos={egosData} uptie={identityUptie} /> : null}
        />
    }

    if (["s1", "s2", "s3", "def", "skills", "passives1", "passives2"].includes(displayType)) {
        return <OverlayBase
            behind={baseComponent}
            content={identityData ? <IdentitySkillSummary identity={identityData} type={displayType} uptie={identityUptie ?? undefined} level={identityLevel ?? undefined} /> : null}
            blockAccess={true}
        />
    }

    if (["ego1", "ego2", "ego3", "ego4", "ego5"].includes(displayType)) {
        const num = Number(displayType.slice(-1)) - 1;

        return <OverlayBase
            behind={baseComponent}
            content={egosData ? <EgoSkillSummary egos={egosData} type={"ego"} threadspins={egoThreadspins} num={num} /> : null}
            blockAccess={true}
        />
    }

    if (["egoa", "egob", "egopassives"].includes(displayType)) {
        return <OverlayBase
            behind={baseComponent}
            content={egosData ? <EgoSkillSummary egos={egosData} type={displayType} threadspins={egoThreadspins} /> : null}
            blockAccess={true}
        />
    }

    if (displayType === "egocosts" || displayType === "egoresists") {
        return <OverlayBase
            behind={baseComponent}
            content={egosData ? <EgoStatsOverlay egos={egosData} displayType={displayType} /> : null}
        />
    }

    if (displayType === "calc") {
        if (!otherOpts.source) return null;

        if (otherOpts.source === "identity") {
            return <OverlayBase
                behind={baseComponent}
                content={identityData ? <IdentitySkillCalc identity={identityData} uptie={identityUptie ?? undefined} level={identityLevel ?? undefined} opts={otherOpts} /> : null}
                blockAccess={true}
            />
        }

        if (otherOpts.source === "ego") {
            return <OverlayBase
                behind={baseComponent}
                content={egosData ? <EgoSkillCalc egos={egosData} threadspins={egoThreadspins ?? undefined} level={identityLevel ?? undefined} opts={otherOpts} /> : null}
                blockAccess={true}
            />
        }
    }

    return <OverlayBase behind={baseComponent} content={null} />
}