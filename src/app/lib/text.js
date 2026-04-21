export function processTextTags(text) {
    const parts = [];
    const regex = /<s>(.*?)<\/s>/g;

    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
        const [fullMatch, content] = match;

        // push text before the match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // push the strikethrough span
        parts.push(
            <span key={key++} style={{ textDecoration: "line-through" }}>
                {content}
            </span>
        );

        lastIndex = match.index + fullMatch.length;
    }

    // push remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}
