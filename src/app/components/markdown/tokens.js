export const tokensDescs = {
    "identity": "Reference an identity with {identity:id} or {id:id}. This will show a link to its page and a tooltip with its keywords and skill types on hover.",
    "ego": "Reference an E.G.O with {ego:id}. This will show a link to its page and a tooltip with its attack types, statuses, and cost on hover.",
    "status": "Reference a status with {status:id} or {st:id}. This will show a tooltip with its description on hover.",
    "statusicon": "Reference a status with {statusicon:id} or {sti:id}. This will show a tooltip with its description on hover. This will only show the icon of the status.",
    "keyword": "Reference a keyword with {keyword:id} or {kw:id}. This will show an icon corresponding to that keyword.",
    "giftname": "Reference an E.G.O Gift with {giftname:id} or {gn:id}. This will show the name of the gift and a tooltip with its description on hover. Clicking on the gift name will show a modal with more details on the gift. Gifts can be assigned enhancement levels by attaching it to the end of the id after a pipe e.g. {giftname:9001|2}. The token will fail to parse if the gift does not have that enhancement level.",
    "gifticons": "Reference E.G.O Gifts with {gifticons:id} or {gi:id}. This will show an icon of the gift centered in its own row and a tooltip with its description on hover. Clicking on the gift icon will show a modal with more details on the gift. This token supports multiple gifts by inputting {gifticons:id1:id2:...} (Insert to text will not automatically handle this). Gifts can be assigned enhancement levels by attaching it to the end of the id after a pipe e.g. {giftname:9001|2}. The token will fail to parse if the gift does not have that enhancement level.",
    "themepack": "Reference a theme pack with {themepack:id} or {tp:id}. This will show a tooltip with its description on hover.",
    "encounter": "Reference an encounter with {encounter:category|id} or {enc:category|id}. This will show a link to its page and a tooltip on hover.",
    "icon": "Show an icon from a list of additional icons {icon:id}.",
    "build": "Reference a build with {build:id}. This will show the name of the build and a tooltip with its search overview on hover. You can find the id of a build on its url or using the share feature on its page. Copying the full url below will automatically isolate the id.",
    "mdplan": "Reference an md plan with {mdplan:id}. This will show the name of the md plan and a tooltip with its search overview on hover. You can find the id of an md plan on its url. Copying the full url below will automatically isolate the id.",
    "collection": "Reference a collection with {collection:id}. This will show the name of the collection and a tooltip with its search overview on hover. You can find the id of a collection on its url. Copying the full url below will automatically isolate the id.",
    "teamcode": "Attach a teamcode that will display its identities on hover. Clicking on it will copy the code into the device's clipboard.",
    "user": "Reference a user with {user:username}. This will show a link to the user's profile. Note that if the user changes their username, this will break. Usernames are also case-sensitive.",
    "sinner": "Reference a sinner with {sinner:id}. This will show the name of the sinner. Useful if you want to accurately type Ryōshū.",
    "sinnericon": "Reference a sinner with {sinnericon:id}. This will show the icon of the sinner.",
    "emote": "Show an emote uploaded through Community Assets. Use the picker menu on the editor interface to get the ids.",
    "sticker": "Show a sticker uploaded through Community Assets. Use the picker menu on the editor interface to get the ids."
}

export const tokenAliases = {
    "id": "identity",
    "st": "status",
    "sti": "statusicon",
    "gn": "giftname",
    "gi": "gifticons",
    "kw": "keyword",
    "tp": "themepack",
    "enc": "encounter",
    "tc": "teamcode"
};

export function convertTokenAlias(type) {
    return tokenAliases[type] ?? type;
}
