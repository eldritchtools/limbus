import { convertTokenAlias } from "./tokens";

const TOKEN_REGEX = /(?<!\\)\{([^:{}\n]+):([^{}\n]+)\}(?!\\)/g;

export function tokenizeMarkdown(text) {
    const parts = [];

    let lastIndex = 0;
    let match;

    while ((match = TOKEN_REGEX.exec(text)) !== null) {
        const before = text.slice(lastIndex, match.index);

        if (before) parts.push({ type: "text", value: before, });

        parts.push({
            type: "token",
            tokenType: match[1],
            tokenValues: match[2].split(":"),
        });

        lastIndex = match.index + match[0].length;
    }

    const tail = text.slice(lastIndex).replace(/\\([{}])/g, "$1");

    if (tail) parts.push({ type: "text", value: tail, });

    return parts;
}

export function extractMarkdownDependencies(markdown) {
    const deps = {
        identity: new Set(),
        ego: new Set(),
        skill: new Set(),
        status: new Set(),
        gift: new Set(),
        gifticon: new Set(),
        themepack: new Set(),
        encounter: new Set(),
        icon: new Set()
    };

    for (const part of tokenizeMarkdown(markdown)) {
        if (part.type !== "token")
            continue;

        switch (convertTokenAlias(part.tokenType)) {
            case "identity":
                deps.identity.add(part.tokenValues[0]);
                break;
            case "ego":
                deps.ego.add(part.tokenValues[0]);
                break;
            case "skill":
                deps.skill.add(part.tokenValues[0]);
                break;
            case "status": case "statusicon":
                deps.status.add(part.tokenValues[0]);
                break;
            case "giftname":
                deps.gift.add(part.tokenValues[0]);
                break;
            case "gifticons":
                part.tokenValues.forEach(x => deps.gifticon.add(x));
                break;
            case "themepack":
                deps.themepack.add(part.tokenValues[0]);
                break;
            case "encounter":
                deps.encounter.add(part.tokenValues[0]);
                break;
            case "icon":
                deps.icon.add(part.tokenValues[0]);
                break;
            default:
                break;
        }
    }

    return deps;
}

export function markdownSlice(str, maxLength) {
    if (str.length <= maxLength) return str;

    let end = maxLength;

    const lastOpen = str.lastIndexOf("{", end - 1);
    const lastClose = str.lastIndexOf("}", end - 1);

    if (lastOpen > lastClose) {
        const close = str.indexOf("}", end);
        if (close !== -1) {
            end = close + 1;
        }
    }

    const isWordChar = c => /[\p{L}\p{N}_'-]/u.test(c);

    if (end < str.length && isWordChar(str[end - 1]) && isWordChar(str[end])) {
        while (end < str.length && isWordChar(str[end])) {
            end++;
        }
    }

    return str.slice(0, end);
}