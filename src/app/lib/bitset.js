function setFlag(mask, index) {
    return mask | (1n << BigInt(index));
};

function unsetFlag(mask, index) {
    return mask & ~(1n << BigInt(index));
};

function hasFlag(mask, index) {
    return (mask & (1n << BigInt(index))) !== 0n;
};

function getAllFlags(mask) {
    const result = [];
    let i = 0;

    while (mask > 0n) {
        if (mask & 1n) result.push(i);
        mask >>= 1n;
        i++;
    }

    return result;
};

function getAllUnsetFlags(mask, maxIndex) {
    const result = [];
    let bit = 1n;

    for (let i = 0; i <= maxIndex; i++) {
        if ((mask & bit) === 0n) {
            result.push(i);
        }
        bit <<= 1n;
    }

    return result;
};

export const bitsetFunctions = {
    setFlag: setFlag,
    unsetFlag: unsetFlag,
    hasFlag: hasFlag,
    getAllFlags: getAllFlags,
    getAllUnsetFlags: getAllUnsetFlags,
    toString: mask => mask.toString(),
    fromString: str => BigInt(str),
    newMask: () => BigInt(0),
}