const defaultSettings = {
    permadeath: false
};

export function getSetting(state, setting) {
    return state.settings?.[setting] ?? defaultSettings[setting];
}

export function setSetting(state, setting, value) {
    if (!(setting in defaultSettings)) return null;

    const nextState = structuredClone(state);
    nextState.settings[setting] = value;
    return nextState;
}
