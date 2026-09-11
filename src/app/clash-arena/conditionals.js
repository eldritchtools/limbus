import Status from "../components/objects/Status";

export function evaluateConditional(conditional, self, target, uniqueStatuses) {
    switch (conditional.type) {
        case "status": {
            const total = conditional.status.reduce((sum, status) => {
                if (status.owner === "unique") {
                    return sum + uniqueStatuses[status.status] ?? 0;
                } else {
                    const side = status.owner === "self" ? self : target;
                    return sum + (side.statuses[status.status]?.[status.type.toLowerCase()] ?? 0);
                }
            }, 0);

            return [
                conditional.target,
                Math.min(
                    Math.floor(total / conditional.per) * conditional.value,
                    conditional.max
                )
            ];
        }
        case "status-individual": {
            const total = conditional.status.reduce((sum, status) => {
                if (status.owner === "unique") {
                    return sum + Math.floor((uniqueStatuses[status.status] ?? 0) / status.per);
                } else {
                    const side = status.owner === "self" ? self : target;
                    return sum + Math.floor((side.statuses[status.status]?.[status.type.toLowerCase()] ?? 0) / status.per);
                }
            }, 0);

            return [
                conditional.target,
                Math.min(total * conditional.value, conditional.max)
            ];
        }
        case "status-optional-condition": {
            const total = conditional.status.reduce((sum, status) => {
                if (status.owner === "unique") {
                    return sum + uniqueStatuses[status.status] ?? 0;
                } else {
                    const side = status.owner === "self" ? self : target;
                    return sum + (side.statuses[status.status]?.[status.type.toLowerCase()] ?? 0);
                }
            }, 0);

            if ((uniqueStatuses[conditional.statusCond] ?? 0) > 0) {
                return [
                    conditional.target,
                    Math.min(
                        Math.floor(total / conditional.perCond) * conditional.valueCond,
                        conditional.maxCond
                    )
                ];
            }

            return [
                conditional.target,
                Math.min(
                    Math.floor(total / conditional.per) * conditional.value,
                    conditional.max
                )
            ];
        }

        case "negative-statuses": {
            const count = ["Combustion", "Laceration", "Vibration", "Burst", "Sinking"]
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

        case "have-hp": {
            const side = conditional.owner === "self" ? self : target;

            return [
                conditional.target,
                Math.min(
                    Math.trunc(side.hp / (conditional.per * 100)) * conditional.value,
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

        case "spd-fixed-or-diff-or-status": {
            const valid = conditional.mode === "higher"
                ? self.speed > conditional.speed ||
                self.speed - target.speed > conditional.per ||
                (uniqueStatuses[conditional.status] ?? 0) > 0
                : self.speed < conditional.speed ||
                target.speed - self.speed > conditional.per ||
                (uniqueStatuses[conditional.status] ?? 0) > 0;

            return [conditional.target, valid ? conditional.value : 0];
        }

        case "rupture-15-3": {
            const rupture = target.statuses.Burst;
            const valid = rupture && rupture.potency >= 15 && rupture.count >= 3;

            return [conditional.target, valid ? conditional.value : 0];
        }

        case "charge-consume-hp": {
            const chargeCount = self.statuses.Charge?.count ?? 0;
            const missingCount = Math.max(conditional.targetCount - chargeCount, 0);
            const requiredHp = missingCount * conditional.hpPerCount;
            const valid = chargeCount >= conditional.minCount && self.hp >= requiredHp;

            return [conditional.target, valid ? conditional.value : 0];
        }

        case "charge-check-potency": {
            const chargePotency = self.statuses.Charge?.potency ?? 0;
            const chargeCount = self.statuses.Charge?.count ?? 0;

            const valid =
                chargeCount >= conditional.targetCount ||
                (
                    chargeCount >= conditional.minCount &&
                    chargePotency >= conditional.minPotency
                );

            return [conditional.target, valid ? conditional.value : 0];
        }

        case "sp-fixed": {
            const side = conditional.owner === "self" ? self : target;

            const valid =
                conditional.mode === "higher"
                    ? side.sp > conditional.sp
                    : side.sp < conditional.sp;

            return [conditional.target, valid ? conditional.value : 0];
        }

        case "sp-rate": {
            const side = conditional.owner === "self" ? self : target;
            const sp = side.sp;
            const per = conditional.per;

            let value = 0;

            if (per > 0 && sp > 0) {
                value = Math.floor(sp / per) * conditional.value;
            } else if (per < 0 && sp < 0) {
                value = Math.floor(-sp / -per) * conditional.value;
            }

            return [conditional.target, value];
        }
    }
}

export function getExplanation(modifier, conditional, withResult) {
    const displayStyle = {};
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
                        <span key={acc.length}>
                            <Status id={status.status} />
                            {status.owner === "unique" ?
                                "" :
                                <>
                                    {status.type === "Potency" ? " Potency" : " Count"}
                                    {status.owner === "self" ? " on self" : " on target"}
                                </>
                            }
                        </span>

                    if (acc.length > 0) acc.push(<span key={`${i}-space`}> + </span>)
                    acc.push(component);
                    return acc;
                }, [])}
                {conditional.value !== conditional.max && ` (max ${conditional.max})`}
                {withResult ? `: +${value}` : null}
            </div>;

        case "status-individual":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {" for every "}
                {conditional.status.reduce((acc, status, i) => {
                    const component =
                        <span key={acc.length}>
                            <span>{status.per} </span>
                            <Status id={status.status} />
                            {status.owner === "unique" ?
                                "" :
                                <>
                                    {status.type === "Potency" ? " Potency" : " Count"}
                                    {status.owner === "self" ? " on self" : " on target"}
                                </>
                            }
                        </span>

                    if (acc.length > 0) acc.push(<span key={`${i}-space`}> or </span>)
                    acc.push(component);
                    return acc;
                }, [])}
                {conditional.value !== conditional.max && ` (max ${conditional.max})`}
                {withResult ? `: +${value}` : null}
            </div>;

        case "status-optional-condition":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {
                    conditional.value === conditional.max ?
                        ` at ${conditional.per}+ ` :
                        ` for every ${conditional.per} `
                }
                {conditional.status.reduce((acc, status, i) => {
                    const component =
                        <span key={acc.length}>
                            <Status id={status.status} />
                            {status.owner === "unique" ?
                                "" :
                                <>
                                    {status.type === "Potency" ? " Potency" : " Count"}
                                    {status.owner === "self" ? " on self" : " on target"}
                                </>
                            }
                        </span>

                    if (acc.length > 0) acc.push(<span key={`${i}-space`}> + </span>)
                    acc.push(component);
                    return acc;
                }, [])}
                {conditional.value !== conditional.max && ` (max ${conditional.max})`}
                {" or with "}
                <Status id={conditional.statusCond} />
                &nbsp;
                {formatTarget(conditional)}
                {
                    conditional.valueCond === conditional.maxCond ?
                        ` at ${conditional.perCond}+ ` :
                        ` for every ${conditional.perCond} `
                }
                {conditional.status.reduce((acc, status, i) => {
                    const component =
                        <span key={acc.length}>
                            <Status id={status.status} />
                            {status.owner === "unique" ?
                                "" :
                                <>
                                    {status.type === "Potency" ? " Potency" : " Count"}
                                    {status.owner === "self" ? " on self" : " on target"}
                                </>
                            }
                        </span>

                    if (acc.length > 0) acc.push(<span key={`${i}-space`}> + </span>)
                    acc.push(component);
                    return acc;
                }, [])}
                {conditional.valueCond !== conditional.maxCond && ` (max ${conditional.maxCond})`}
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

        case "have-hp":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {
                    conditional.value === conditional.max ?
                        ` at ${conditional.per * 100}%+ hp` :
                        ` for every ${conditional.per * 100}% hp (max ${conditional.max})`
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

        case "spd-fixed-or-diff-or-status":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {
                    conditional.mode === "higher" ?
                        ` at ${conditional.speed + 1}+ speed or ${conditional.per} speed faster than the target or with ` :
                        ` at ${conditional.speed - 1}- speed or ${conditional.per} speed slower than the target or with `
                }
                <Status id={conditional.status} />
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

        case "charge-consume-hp":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {` at ${conditional.targetCount}+ `}
                <Status id={"Charge"} />
                {` Count or at ${conditional.minCount}+ `}
                <Status id={"Charge"} />
                {` Count spend ${conditional.hpPerCount * 100}% hp per missing Count`}
                {withResult ? `: +${value}` : null}
            </div>;

        case "charge-check-potency":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {` at ${conditional.targetCount}+ `}
                <Status id={"Charge"} />
                {` Count or at ${conditional.minPotency}+ and ${conditional.minCount}+ `}
                <Status id={"Charge"} />
                {` Potency and Count`}
                {withResult ? `: +${value}` : null}
            </div>;

        case "sp-fixed":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {
                    conditional.mode === "higher" ?
                        ` at ${conditional.sp + 1}+ sp` :
                        ` at ${conditional.sp - 1}- sp`
                }
                {conditional.owner === "self" ? " on self" : " on target"}
                {withResult ? `: +${value}` : null}
            </div>;

        case "sp-rate":
            return <div style={displayStyle}>
                {formatTarget(conditional)}
                {` for every ${conditional.per} sp`}
                {conditional.owner === "self" ? " on self" : " on target"}
                {withResult ? `: +${value}` : null}
            </div>;
    }
}

function formatTarget(conditional) {
    switch (conditional.target) {
        case "base": return `Base/Final Power +${conditional.value}`;
        case "coin": return `Coin Power +${conditional.value}`;
        case "clash": return `Clash Power +${conditional.value}`;
        case "offense-level": return `Offense Level +${conditional.value}`
        default: return "";
    }
}