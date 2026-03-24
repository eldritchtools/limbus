function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return str; // Handle empty strings or non-string inputs
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const uiStrings = {
    contentNoUser: type => `When not logged in, ${type} are saved locally on this device. After logging in, you can sync them to your account. ${capitalizeFirstLetter(type)} that are not synced cannot be accessed while logged in.`,
    savedContentNoUser: type => `When not logged in, saved ${type} are stored locally on this device. After logging in, you can sync them to your account. Saved ${type} that are not synced cannot be accessed while logged in. Local drafts cannot be saved.`,
    noPublishedContent: type => `No published ${type} yet`,
    noDrafts: "No drafts yet",
    noSavedContent: type => `No saved ${type} yet`,
    noMoreContent: type => `No more ${type}`,
    noLocalContent: type => `Locally saved ${type} are not supported.`,
    drafts: "Drafts can still be shared through the link, but aren't searchable and don't allow comments."
}