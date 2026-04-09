export function encodeBuildExtraOpts(identityUpties, identityLevels, egoThreadspins, sinnerNotes) {
    const iu = identityUpties.reduce((acc, uptie, index) => {
        if (uptie !== "") acc.push(`${index}=${uptie}`);
        return acc;
    }, []).join(",");

    const il = identityLevels.reduce((acc, level, index) => {
        if (level !== "") acc.push(`${index}=${level}`);
        return acc;
    }, []).join(",");

    const et = egoThreadspins.reduce((accOuter, list, indexOuter) => {
        return list.reduce((acc, uptie, index) => {
            if (uptie !== "") acc.push(`${indexOuter * 5 + index}=${uptie}`);
            return acc;
        }, accOuter);
    }, []).join(",");

    const sn = sinnerNotes.reduce((acc, note, index) => {
        if (note !== "") acc.push(`${index}=${encodeURIComponent(note)}`);
        return acc;
    }, []).join(",");

    let encoded = [];
    if (iu.length > 0) encoded.push(`iu:${iu}`);
    if (il.length > 0) encoded.push(`il:${il}`);
    if (et.length > 0) encoded.push(`et:${et}`);
    if (sn.length > 0) encoded.push(`sn:${sn}`);
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
        switch (type) {
            case "iu":
                if (parts && !parts.includes("iu")) return acc;
                acc.identityUpties = decodePart(vals, 12);
                return acc;
            case "il":
                if (parts && !parts.includes("il")) return acc;
                acc.identityLevels = decodePart(vals, 12);
                return acc;
            case "et":
                if (parts && !parts.includes("et")) return acc;
                acc.egoThreadspins = decodePart2(vals, 12, 5);
                return acc;
            case "sn":
                if (parts && !parts.includes("sn")) return acc;
                acc.sinnerNotes = decodePart(vals, 12, true);
                return acc;
        }
    }, {});
}
