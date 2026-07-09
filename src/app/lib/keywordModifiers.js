function validateCondition(cond, data) {
    if(cond.type === "ego") {
        return data.egoIds?.includes(cond.id);
    }
    return false;
}

export function validateModifier(modifier, data) {
    return modifier.conds.every(x => validateCondition(x, data));
}