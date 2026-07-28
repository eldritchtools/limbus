import styles from "./BuildDisplay.module.css";
import BuildDisplayCalc from "./BuildDisplayCalc";
import BuildDisplaySinnerContainer from "./BuildDisplaySinnerContainer";
import MarkdownRenderer from "../markdown/MarkdownRenderer";
import SkillReplace from "../skill/SkillReplace";

export function BuildDisplayMain({
    identityIds, egoIds, identityUpties, identityLevels, egoThreadspins,
    sinnerNotes, iconSwaps, deploymentOrder, skillReplaces, activeSinners, displayType, disableLinks,
    otherOpts
}) {
    const upties = identityUpties ? identityUpties.map(x => x === "" ? null : x) : null;
    const levels = identityLevels ? identityLevels.map(x => x === "" ? null : x) : null;
    const threadspins = egoThreadspins ? egoThreadspins.map(x => x.map(y => y === "" ? null : y)) : null;
    const notes = sinnerNotes ? sinnerNotes.map(x => x === "" ? null : x) : null;

    return <div className={`${styles.buildDisplay} ${displayType === "ids" || displayType === "ego-comp" ? styles.idsOnly : null}`} style={{ alignSelf: "center", transform: "translateZ(0)" }}>
        {Array.from({ length: 12 }, (_, index) => {
            let egosDisplay = Array.from({ length: 5 }, () => null);
            if (egoIds && Array.isArray(egoIds) && egoIds[index] && Array.isArray(egoIds[index])) {
                egosDisplay = egoIds[index].map(id => id || null);
            }

            return <div key={index} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <BuildDisplaySinnerContainer
                    displayType={displayType}
                    sinnerId={index + 1}
                    identityId={identityIds[index] || null}
                    egoIds={egosDisplay}
                    identityUptie={upties ? upties[index] : null}
                    identityLevel={levels ? levels[index] : null}
                    egoThreadspins={threadspins ? threadspins[index] : null}
                    deploymentOrder={deploymentOrder}
                    activeSinners={activeSinners}
                    swapIcon={iconSwaps?.includes(index + 1)}
                    otherOpts={otherOpts}
                    disableLinks={disableLinks}
                />
                {skillReplaces?.[index + 1] ?
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", alignSelf: "center" }}>
                        Skills: <SkillReplace counts={skillReplaces[index + 1] ?? "321"} />
                    </div> : null}
                {notes && notes[index] ?
                    <div style={{ margin: "0 0.5rem" }}>
                        <MarkdownRenderer content={notes[index]} />
                    </div> : null}
            </div>
        })}
    </div>
}

export default function BuildDisplay({ displayType, ...props }) {
    if (displayType === "calc") {
        return <BuildDisplayCalc {...props} />
    } else {
        return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <BuildDisplayMain displayType={displayType} {...props} />
        </div>
    }
}