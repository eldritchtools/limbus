import { LEVEL_CAP } from "./constants";

export function constructHp(data, level) {
    const hp = Math.floor(data.hp.base + (level ?? LEVEL_CAP) * data.hp.level);
    const thresholds = data.breakSection.toReversed().map(x => Math.floor(hp * x / 100)).join(",");

    return `${hp} (${thresholds})`;
}

export function constructSpeed(data, uptie) {
    return data.speedList[(uptie ?? 4) - 1].join(" - ")
}

export function constructDefenseLevel(data, level) {
    return `${(level ?? LEVEL_CAP) + data.defCorrection} (${data.defCorrection >= 0 ? `+${data.defCorrection}` : data.defCorrection})`;
}