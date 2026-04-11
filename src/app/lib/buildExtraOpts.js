export function encodeBuildExtraOpts({ deploymentOrder, activeSinners, identityUpties, identityLevels, egoThreadspins, sinnerNotes }) {
    let encoded = [];
    if (deploymentOrder) {
        const deo = deploymentOrder.join(",");
        if (deo.length > 0) encoded.push(`do:${deo}`);
    }

    if (activeSinners) {
        encoded.push(`as:${activeSinners}`);
    }

    if (identityUpties) {
        const iu = identityUpties.reduce((acc, uptie, index) => {
            if (uptie !== "") acc.push(`${index}=${uptie}`);
            return acc;
        }, []).join(",");
        if (iu.length > 0) encoded.push(`iu:${iu}`);
    }

    if (identityLevels) {
        const il = identityLevels.reduce((acc, level, index) => {
            if (level !== "") acc.push(`${index}=${level}`);
            return acc;
        }, []).join(",");
        if (il.length > 0) encoded.push(`il:${il}`);
    }

    if (egoThreadspins) {
        const et = egoThreadspins.reduce((accOuter, list, indexOuter) => {
            return list.reduce((acc, uptie, index) => {
                if (uptie !== "") acc.push(`${indexOuter * 5 + index}=${uptie}`);
                return acc;
            }, accOuter);
        }, []).join(",");
        if (et.length > 0) encoded.push(`et:${et}`);
    }

    if (sinnerNotes) {
        const sn = sinnerNotes.reduce((acc, note, index) => {
            if (note !== "") acc.push(`${index}=${encodeURIComponent(note)}`);
            return acc;
        }, []).join(",");
        if (sn.length > 0) encoded.push(`sn:${sn}`);
    }

    return encoded.join("|");
}

export function decodeBuildExtraOpts(string, parts = null) {
    if (string.length === 0) return {};

    const decodePart = (part, size, text = false) => {
        return part.split(",").reduce((acc, val) => {
            const idx = val.indexOf("=");
            const i = Number(val.slice(0, idx));
            const n = val.slice(idx + 1);
            acc[i] = text ? decodeURIComponent(n) : Number(n);
            return acc;
        }, Array.from({ length: size }, () => ""))
    }

    const decodePart2 = (part, size1, size2) => {
        return part.split(",").reduce((acc, val) => {
            const idx = val.indexOf("=");
            const i = Number(val.slice(0, idx));
            const n = val.slice(idx + 1);
            acc[Math.floor(i / size2)][i % size2] = Number(n);
            return acc;
        }, Array.from({ length: size1 }, () => Array.from({ length: size2 }, () => "")))
    }

    return string.split("|").reduce((acc, part) => {
        const [type, vals] = part.split(":");
        if (parts && !parts.includes(type)) return acc;
        switch (type) {
            case "do":
                acc.deploymentOrder = vals.split(",").map(x => Number(x));
                return acc;
            case "as":
                acc.activeSinners = Number(vals);
                return acc;
            case "iu":
                acc.identityUpties = decodePart(vals, 12);
                return acc;
            case "il":
                acc.identityLevels = decodePart(vals, 12);
                return acc;
            case "et":
                acc.egoThreadspins = decodePart2(vals, 12, 5);
                return acc;
            case "sn":
                acc.sinnerNotes = decodePart(vals, 12, true);
                return acc;
        }
    }, {});
}
