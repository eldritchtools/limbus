const aliases = {
    "id": "identity",
    "st": "status",
    "sti": "statusicon",
    "gn": "giftname",
    "gi": "gifticons",
    "kw": "keyword",
    "tp": "themepack"
};

export function convertMarkdownAlias(type) {
    return aliases[type] ?? type;
}
