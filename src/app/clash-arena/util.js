import Status from "../components/objects/Status";
import { keywordStatusMapping } from "../lib/constants";

 
export const defaultSettings = {
    teamSize: 3,
    rounds: 12,
    draftOrder: "cycle",
    numStatus: [1, 4],
    statusPotency: [1, 20],
    statusCount: [1, 20],
    hp: [1, 100],
    speed: [1, 10],
    sp: [0, 45]
};

export function phaseConvert(phase) {
    switch (phase) {
        case "draft_complete": return "draftComplete";
        case "round_select": return "roundSelect";
        case "round_reveal": return "roundReveal";
        default: return phase;
    }
}

export function settingsToServer(key) {
    switch (key) {
        case "teamSize": return "team_size";
        case "draftOrder": return "draft_order";
        case "numStatus": return "num_status";
        case "statusPotency": return "status_potency";
        case "statusCount": return "status_count";
        default: return key;
    }
}

export function settingsToClient(key) {
    switch (key) {
        case "team_size": return "teamSize";
        case "draft_order": return "draftOrder";
        case "num_status": return "numStatus";
        case "status_potency": return "statusPotency";
        case "status_count": return "statusCount";
        default: return key;
    }
}

export function calculateSkillRange(skill, self, target, withExplanation = false, withResult = true) {
    const modifiers = (skill.conditionals ?? []).map(x => evaluateConditional(x, self, target, withExplanation, withResult));

    const base = skill.base + modifierSum(modifiers, "base");
    const coin = skill.coin + modifierSum(modifiers, "coin");
    const clash = modifierSum(modifiers, "clash");
    const levelCorrection = Math.trunc(skill.levelCorrection / 3);

    const min = base + clash + levelCorrection;
    const max = min + coin * skill.coins;

    const result = { min: Math.min(min, max), max: Math.max(min, max), coin: coin };
    if (withExplanation) result.modifiers = modifiers.map((x, i) => [...x, getExplanation(x, skill.conditionals[i], withResult)])

    return result;
}

function modifierSum(modifiers, target) {
    return modifiers
        .filter(([modifierTarget]) => modifierTarget === target)
        .reduce((sum, [, value]) => sum + value, 0);
}

function evaluateConditional(conditional, self, target) {
    switch (conditional.type) {
        case "status": {
            const total = conditional.status.reduce((sum, status) => {
                const side = status.owner === "self" ? self : target;
                return sum + (side.statuses[status.status]?.[status.type.toLowerCase()] ?? 0);
            }, 0);

            return [
                conditional.target,
                Math.min(
                    Math.floor(total / conditional.per) * conditional.value,
                    conditional.max
                )
            ];
        }

        case "negative-statuses": {
            const count = ["Burn", "Bleed", "Tremor", "Rupture", "Sinking"]
                .filter(status => status in target.statuses)
                .length;

            return [
                conditional.target,
                Math.min(
                    Math.floor(count / conditional.per) * conditional.value,
                    conditional.max
                )
            ];
        }

        case "always":
            return [conditional.target, conditional.value];

        case "missing-hp": {
            const side = conditional.owner === "self" ? self : target;
            const missingHp = 100 - side.hp;

            return [
                conditional.target,
                Math.min(
                    Math.trunc(missingHp / (conditional.per * 100)) * conditional.value,
                    conditional.max
                )
            ];
        }

        case "spd-fixed": {
            const valid = conditional.mode === "higher"
                ? self.speed > conditional.speed
                : self.speed < conditional.speed;

            return [conditional.target, valid ? conditional.value : 0];
        }

        case "spd-diff": {
            const difference = conditional.mode === "higher"
                ? self.speed - target.speed
                : target.speed - self.speed;

            return [
                conditional.target,
                difference > 0
                    ? Math.min(
                        Math.floor(difference / conditional.per) * conditional.value,
                        conditional.max
                    )
                    : 0
            ];
        }

        case "spd-fixed-or-diff": {
            const valid = conditional.mode === "higher"
                ? self.speed > conditional.speed ||
                self.speed - target.speed > conditional.per
                : self.speed < conditional.speed ||
                target.speed - self.speed > conditional.per;

            return [conditional.target, valid ? conditional.value : 0];
        }

        case "rupture-15-3": {
            const rupture = target.statuses.Rupture;
            const valid = rupture && rupture.potency >= 15 && rupture.count >= 3;

            return [conditional.target, valid ? conditional.value : 0];
        }
    }
}

function getExplanation(modifier, conditional, withResult) {
    const displayStyle = { };
    const [, value] = modifier;

    switch (conditional.type) {
        case "status":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {
                    conditional.value === conditional.max ?
                        ` at ${conditional.per}+ ` :
                        ` for every ${conditional.per} `
                }
                {conditional.status.reduce((acc, status, i) => {
                    const component =
                        <span key={status.status}>
                            <Status id={keywordStatusMapping[status.status]} />
                            {status.type === "Potency" ? " Potency" : " Count"}
                            {status.owner === "self" ? " on self" : " on target"}
                        </span>

                    if (acc.length > 0) acc.push(<span key={`${i}-space`}> + </span>)
                    acc.push(component);
                    return acc;
                }, [])}
                {conditional.value !== conditional.max && ` (max ${conditional.max})`}
                {withResult ? `: +${value}` : null}
            </div>;

        case "negative-statuses":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {
                    conditional.value === conditional.max ?
                        ` at ${conditional.per}+ negative effects on target` :
                        ` for every ${conditional.per} negative effects on target (max ${conditional.max})`
                }
                {withResult ? `: +${value}` : null}
            </div>;

        case "always":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {" always"}
                {withResult ? `: +${value}` : null}
            </div>;

        case "missing-hp":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {
                    conditional.value === conditional.max ?
                        ` at ${conditional.per * 100}%+ missing hp` :
                        ` for every ${conditional.per * 100}% missing hp (max ${conditional.max})`
                }
                {withResult ? `: +${value}` : null}
            </div>;

        case "spd-fixed":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {
                    conditional.mode === "higher" ?
                        ` at ${conditional.speed + 1}+ speed` :
                        ` at ${conditional.speed - 1}- speed`
                }
                {withResult ? `: +${value}` : null}
            </div>;

        case "spd-diff":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {
                    conditional.value === conditional.max ?
                        ` at ${conditional.per}+` :
                        ` for every ${conditional.per}`
                }
                {` speed ${conditional.mode === "higher" ? "above" : "below"} the target`}
                {conditional.value !== conditional.max && ` (max ${conditional.max})`}
                {withResult ? `: +${value}` : null}
            </div>

        case "spd-fixed-or-diff":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {
                    conditional.mode === "higher" ?
                        ` at ${conditional.speed + 1}+ speed or ${conditional.per} speed faster than the target` :
                        ` at ${conditional.speed - 1}- speed or ${conditional.per} speed slower than the target`
                }
                {withResult ? `: +${value}` : null}
            </div>

        case "rupture-15-3":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {" at 15+ "}
                <Status id={"Burst"} />
                {" Potency and 3+ "}
                <Status id={"Burst"} />
                {" Count on the target"}
                {withResult ? `: +${value}` : null}
            </div>;
    }
}

function formatTarget(conditional) {
    switch (conditional.target) {
        case "base": return `Base/Final Power +${conditional.value}`;
        case "coin": return `Coin Power +${conditional.value}`;
        case "clash": return `Clash Power +${conditional.value}`;
        default: return "";
    }
}