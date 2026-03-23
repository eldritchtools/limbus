const aliases = {
    "id": "identity",
    "st": "status",
    "gn": "giftname",
    "gi": "gifticons",
    "kw": "keyword"
};

export function convertMarkdownAlias(type) {
    return aliases[type] ?? type;
}
