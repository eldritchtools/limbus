import React from "react";

import { TextWithStatuses } from "@/app/lib/statusReplacement";

const tagMap = {
    style: ({ value, children, key }) => <span key={key}>{children}</span>,
    color: ({ value, children, key }) => <span key={key} style={{ color: value }}>{children}</span>,
    mark: ({ value, children, key }) => <span key={key} style={{ backgroundColor: value }}>{children}</span>,
    b: ({ children, key }) => <span key={key} style={{ fontWeight: "bold" }}>{children}</span>,
    u: ({ children, key }) => <span key={key} style={{ textDecoration: "underline" }}>{children}</span>,
    s: ({ children, key }) => <span key={key} style={{ textDecoration: "line-through" }}>{children}</span>,
};

function parseToTree(input) {
    let i = 0;
    let keyCounter = 0;

    const root = {
        type: "root",
        children: []
    };

    const stack = [root];

    const current = () => stack[stack.length - 1];

    while (i < input.length) {
        if (input.startsWith("</", i)) {
            const match = input.slice(i).match(/^<\/([a-zA-Z0-9]+)>/);

            if (!match) {
                i++;
                continue;
            }

            const tagName = match[1];
            i += match[0].length;

            for (let j = stack.length - 1; j >= 0; j--) {
                if (stack[j].name === tagName) {
                    stack.length = j;
                    break;
                }
            }

            continue;
        }

        if (input[i] === "<") {
            const match = input.slice(i).match(
                /^<([a-zA-Z0-9]+)(?:=([^\s>]+)|((?:\s+[a-zA-Z0-9]+=[^\s>]+)*))\s*>/
            );

            if (!match) {
                i++;
                continue;
            }

            const [, name, singleValue, attrString] = match;
            i += match[0].length;

            let value = null;

            if (singleValue) value = singleValue;

            if (attrString) {
                const m = attrString.match(/([a-zA-Z0-9]+)=([^\s>]+)/);
                if (m) value = m[2];
            }

            const node = {
                type: "tag",
                name,
                value,
                children: [],
                key: keyCounter++
            };

            current().children.push(node);
            stack.push(node);

            continue;
        }

        let textEnd = input.indexOf("<", i);
        if (textEnd === -1) textEnd = input.length;

        const text = input.slice(i, textEnd);
        i = textEnd;

        if (text) {
            current().children.push({
                type: "text",
                text,
                key: keyCounter++
            });
        }
    }

    return root.children;
}

function renderNodes(nodes, options = {}) {
    const {
        enableTooltips = true,
        iconStyleOverride = {},
        nameStyleOverride = {},
        allowReplacement = true,
        textOnly = false
    } = options;

    function render(node) {
        if (node.type === "text") {
            if (allowReplacement)
                return <TextWithStatuses
                    key={node.key}
                    templateText={node.text}
                    includeTooltips={enableTooltips}
                    iconStyleOverride={iconStyleOverride}
                    nameStyleOverride={nameStyleOverride}
                />;
            else
                return node.text
        }

        const children = (node.children || []).map(render);

        if(textOnly) return children.join("");

        const renderer = tagMap[node.name];

        if (renderer) {
            return renderer({
                value: node.value,
                children,
                key: node.key
            });
        }

        return (
            <span key={node.key} data-tag={node.name}>
                {children}
            </span>
        );
    }

    return nodes.map(render);
}

function parse(input, options) {
    const tree = parseToTree(input, options.textOnly);
    return renderNodes(tree, options);
}

export default function ProcessedText({ text, enableTooltips = true, iconStyleOverride = {}, nameStyleOverride = {}, allowReplacement = true }) {
    return parse(text, { enableTooltips, iconStyleOverride, nameStyleOverride, allowReplacement });
}

export function processText(text) {
    return parse(text, {enableTooltips: false, allowReplacement: false, textOnly: true})[0];
}