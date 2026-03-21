export function encodeBuildExtraOpts(identityUpties, identityLevels, egoThreadspins) {
    const iu = identityUpties.reduce((acc, uptie, index) => {
        if (uptie === "") return acc;
        if (acc.length === 0) return `${index}=${uptie}`;
        else return `${acc},${index}=${uptie}`;
    }, "");

    const il = identityLevels.reduce((acc, level, index) => {
        if (level === "") return acc;
        if (acc.length === 0) return `${index}=${level}`;
        else return `${acc},${index}=${level}`;
    }, "");

    const et = egoThreadspins.reduce((accOuter, list, indexOuter) => {
        return list.reduce((acc, uptie, index) => {
            if (uptie === "") return acc;
            if (acc.length === 0) return `${indexOuter * 5 + index}=${uptie}`;
            else return `${acc},${indexOuter * 5 + index}=${uptie}`;
        }, accOuter);
    }, "");

    let encoded = "";
    if (iu.length > 0) {
        if (encoded.length > 0) encoded += "|";
        encoded += `iu:${iu}`;
    }
    if (il.length > 0) {
        if (encoded.length > 0) encoded += "|";
        encoded += `il:${il}`;
    }
    if (et.length > 0) {
        if (encoded.length > 0) encoded += "|";
        encoded += `et:${et}`;
    }
    return encoded;
}

export function decodeBuildExtraOpts(string, parts = null) {
    if (string.length === 0) return {};

    const decodePart = (part, size) => {
        return part.split(",").reduce((acc, val) => {
            const [i, n] = val.split("=");
            acc[i] = Number(n);
            return acc;
        }, Array.from({ length: size }, () => ""))
    }

    const decodePart2 = (part, size1, size2) => {
        return part.split(",").reduce((acc, val) => {
            const [i, n] = val.split("=");
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
        }
    }, {});
}
