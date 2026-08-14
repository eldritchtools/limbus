import styles from "./BuildDisplay.module.css";
import BuildDisplayCalc from "./BuildDisplayCalc";
import BuildDisplaySinnerContainer from "./BuildDisplaySinnerContainer";
import MarkdownRenderer from "../markdown/MarkdownRenderer";
import SkillReplace from "../skill/SkillReplace";

export function BuildDisplayMain({ build, displayType, disableLinks, otherOpts }) {
    const upties = build.identityUpties?.map(x => x === "" ? null : x);
    const levels = build.identityLevels?.map(x => x === "" ? null : x);
    const threadspins = build.egoThreadspins?.map(x => x.map(y => y === "" ? null : y));
    const notes = build.sinnerNotes?.map(x => x === "" ? null : x);

    return <div
        className={`${styles.buildDisplay} ${displayType === "ids" || displayType === "ego-comp" ? styles.idsOnly : null}`}
        style={{ alignSelf: "center", transform: "translateZ(0)" }}
    >
        {Array.from({ length: 12 }, (_, index) => {
            let egosDisplay = Array.from({ length: 5 }, () => null);
            if (build.egoIds && Array.isArray(build.egoIds) && build.egoIds[index] && Array.isArray(build.egoIds[index])) {
                egosDisplay = build.egoIds[index].map(id => id || null);
            }

            return <div key={index} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <BuildDisplaySinnerContainer
                    displayType={displayType}
                    sinnerId={index + 1}
                    identityId={build.identityIds[index] || null}
                    egoIds={egosDisplay}
                    identityUptie={upties?.[index]}
                    identityLevel={levels?.[index]}
                    egoThreadspins={threadspins?.[index]}
                    deploymentOrder={build.deploymentOrder}
                    activeSinners={build.activeSinners}
                    swapIcon={build.iconSwaps?.includes(index + 1)}
                    altOptions={build.altOptions?.[index] ?? []}
                    otherOpts={otherOpts}
                    disableLinks={disableLinks}
                />
                {build.skillReplaces?.[index + 1] ?
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", alignSelf: "center" }}>
                        Skills: <SkillReplace counts={build.skillReplaces[index + 1] ?? "321"} />
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