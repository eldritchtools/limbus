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