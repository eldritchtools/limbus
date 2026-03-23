import { RangeSetBuilder } from '@codemirror/state';
import { Decoration, ViewPlugin } from '@codemirror/view';

export const markdownStyling = ViewPlugin.fromClass(class {
    constructor(view) {
        this.decorations = this.build(view);
    }

    update(update) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.build(update.view);
        }
    }

    resetState(state) {
        state.bold = false;
        state.italic = false;
        state.code = false;
        state.math = false;
        state.escape = false;
        state.linkText = false;
        state.linkUrl = false;
    }

    scanLine(text, lineFrom, builder, state) {
        const decos = [];
        const add = (from, to, cls) =>
            decos.push({ from, to, deco: Decoration.mark({ class: cls }) });

        let i = 0;
        while (i < text.length) {
            const ch = text[i];
            const next = text[i + 1];

            // Escape handling
            if (!state.escape && ch === "\\") {
                state.escape = true;
                i++;
                continue;
            }

            // Inline code: `...`
            if (!state.escape && ch === "`") {
                state.code = !state.code;
                add(lineFrom + i, lineFrom + i + 1, "cm-code-marker");
                i++;
                continue;
            }

            // If inside code, everything is literal
            if (state.code) {
                add(lineFrom + i, lineFrom + i + 1, "cm-code");
                i++;
                continue;
            }

            // Bold: **
            if (!state.escape && ch === "*" && next === "*") {
                state.bold = !state.bold;
                add(lineFrom + i, lineFrom + i + 2, "cm-bold-marker");
                i += 2;
                continue;
            }

            // Italic: *
            if (!state.escape && ch === "*") {
                state.italic = !state.italic;
                add(lineFrom + i, lineFrom + i + 1, "cm-italic-marker");
                i++;
                continue;
            }

            // Inline math: $...$
            if (!state.escape && ch === "$") {
                state.math = !state.math;
                add(lineFrom + i, lineFrom + i + 1, "cm-math-inline");
                i++;
                continue;
            }

            // Link text: [text]
            if (!state.escape && ch === "[") {
                state.linkText = true;
                add(lineFrom + i, lineFrom + i + 1, "cm-link-marker");
                i++;
                continue;
            }

            if (!state.escape && ch === "]" && state.linkText) {
                state.linkText = false;
                add(lineFrom + i, lineFrom + i + 1, "cm-link-marker");
                i++;
                continue;
            }

            // Link URL: (url)
            if (!state.escape && ch === "(" && !state.linkText) {
                state.linkUrl = true;
                add(lineFrom + i, lineFrom + i + 1, "cm-link-url-marker");
                i++;
                continue;
            }

            if (!state.escape && ch === ")" && state.linkUrl) {
                state.linkUrl = false;
                add(lineFrom + i, lineFrom + i + 1, "cm-link-url-marker");
                i++;
                continue;
            }

            // Apply active styles
            if (state.bold) add(lineFrom + i, lineFrom + i + 1, "cm-bold");
            if (state.italic) add(lineFrom + i, lineFrom + i + 1, "cm-italic");
            if (state.math) add(lineFrom + i, lineFrom + i + 1, "cm-math-inline");
            if (state.linkText) add(lineFrom + i, lineFrom + i + 1, "cm-link");
            if (state.linkUrl) add(lineFrom + i, lineFrom + i + 1, "cm-link-url");

            state.escape = false;
            i++;
        }

        // Decorations are already in order, but sorting is harmless
        decos.sort((a, b) => a.from - b.from);

        for (const d of decos) builder.add(d.from, d.to, d.deco);
    }

    decorateBlock(text, lineFrom, builder) {
        if (text.startsWith("#")) {
            builder.add(lineFrom, lineFrom, Decoration.line({ class: "cm-heading" }));
        } else if (text.startsWith(">")) {
            builder.add(lineFrom, lineFrom, Decoration.line({ class: "cm-quote" }));
        } else if (/^(\s*)([-+*]|\d+\.)\s/.test(text)) {
            builder.add(lineFrom, lineFrom, Decoration.line({ class: "cm-list" }));
        }
    }

    build(view) {
        const builder = new RangeSetBuilder();
        const doc = view.state.doc;

        const state = {
            bold: false,
            italic: false,
            code: false,
            math: false,
            escape: false,
            linkText: false,
            linkUrl: false
        };

        for (let { from, to } of view.visibleRanges) {
            let pos = from;
            while (pos <= to) {
                const line = doc.lineAt(pos);
                const text = line.text;

                if (text.trim() === "") {
                    this.resetState(state);
                    pos = line.to + 1;
                    continue;
                }

                this.decorateBlock(text, line.from, builder);
                this.scanLine(text, line.from, builder, state);

                pos = line.to + 1;
            }
        }

        return builder.finish();
    }
}, {
    decorations: v => v.decorations
});