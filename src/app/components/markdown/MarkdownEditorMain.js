'use client';

import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { EditorSelection, EditorState } from '@codemirror/state';
import { Transaction } from "@codemirror/state";
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    FaBold, FaItalic, FaHeading, FaQuoteRight,
    FaLink, FaImage, FaListUl, FaListOl, FaQuestionCircle,
    FaCode
} from 'react-icons/fa';

import { backspaceTriggersCompletion, tabAcceptsCompletion, tokenAutocomplete, useAutocompleteDataFacetExtension } from './MarkdownEditorAutocomplete';
import { markdownStyling } from './MarkdownEditorStyling';
import "./MarkdownEditorMain.css"
import CommunityAssetPicker from '../communityAssets/CommunityAssetPicker';
import { EmoteSolid, StickerSolid } from '../contentActions/Symbols';
import DragContainer from '../objects/DragContainer';
import { getGeneralTooltipProps } from '../tooltips/GeneralTooltip';

/* ---------- Helpers ---------- */

function safeLine(view, pos) {
    const docLength = view.state.doc.length;
    if (docLength === 0) return { from: 0, to: 0, text: '' };
    const safePos = Math.min(Math.max(pos, 0), docLength - 1);
    return view.state.doc.lineAt(safePos);
}

function safeSelection(view) {
    const sel = view.state.selection.main;
    const docLength = view.state.doc.length;
    const from = Math.min(Math.max(sel.from, 0), docLength);
    const to = Math.min(Math.max(sel.to, 0), docLength);
    return { from, to };
}

function safeDispatch(view, changes, selection) {
    const newDocLength =
        view.state.doc.length +
        (changes.insert?.length || 0) -
        (changes.to - changes.from);

    const clamp = (pos) => Math.min(Math.max(pos, 0), newDocLength);

    view.dispatch({
        changes,
        selection: {
            anchor: clamp(selection.anchor),
            head: clamp(selection.head),
        },
    });
}

/* ---------- Formatting actions ---------- */

function toggleWrap(view, token) {
    const { from, to } = view.state.selection.main;
    const doc = view.state.doc;
    const line = doc.lineAt(from);
    const text = line.text;

    const selStart = from - line.from;
    const selEnd = to - line.from;

    // Find all indices of the token in the line
    const indices = [];
    let idx = text.indexOf(token);
    while (idx !== -1) {
        indices.push(idx);
        idx = text.indexOf(token, idx + token.length);
    }

    // Determine if selection is inside a wrapped span
    let inside = false;
    let openMarker = null;
    let closeMarker = null;

    for (let i = 0; i < indices.length; i += 2) {
        const open = indices[i];
        const close = indices[i + 1];

        if (close == null) break; // unmatched token, ignore

        // Selection is inside this span if:
        //   open < selEnd AND close > selStart
        if (open < selEnd && close + token.length > selStart) {
            inside = true;
            openMarker = open;
            closeMarker = close;
            break;
        }
    }

    if (inside && openMarker !== null && closeMarker !== null) {
        // Unwrap: remove the markers
        view.dispatch(view.state.update({
            changes: [
                { from: line.from + openMarker, to: line.from + openMarker + token.length },
                { from: line.from + closeMarker, to: line.from + closeMarker + token.length }
            ],
            selection: EditorSelection.single(from - token.length, to - token.length),
            annotations: Transaction.userEvent.of("input")
        }));
    } else {
        // Wrap: add markers around selection
        const selected = doc.sliceString(from, to);
        const insert = `${token}${selected}${token}`;
        view.dispatch(view.state.update({
            changes: { from, to, insert },
            selection: EditorSelection.single(from + token.length, from + token.length + selected.length),
            annotations: Transaction.userEvent.of("input")
        }));
    }
    view.focus();
}

function insertOrCycleHeading(view) {
    if (!view) return;
    const { from } = safeSelection(view);
    const line = safeLine(view, from);
    const match = line.text.match(/^(#{1,6})\s/);
    let level = match ? match[1].length + 1 : 1;
    if (level > 6) level = 1;
    const start = line.from;
    const end = match ? line.from + match[0].length : line.from;
    const insertText = '#'.repeat(level) + ' ';
    safeDispatch(view,
        { from: start, to: end, insert: insertText },
        { anchor: start + insertText.length, head: start + insertText.length }
    );
    view.focus();
}

function insertAtLineStart(view, insertText) {
    if (!view) return;
    const { from } = safeSelection(view);
    const line = safeLine(view, from);
    safeDispatch(view,
        { from: line.from, to: line.from, insert: insertText },
        { anchor: from + insertText.length, head: from + insertText.length }
    );
    view.focus();
}

const insertQuote = (view) => insertAtLineStart(view, '> ');
const insertBullet = (view) => insertAtLineStart(view, '- ');
const insertNumbered = (view) => insertAtLineStart(view, '1. ');

function insertLink(view) {
    if (!view) return;
    const { from, to } = safeSelection(view);
    const selected = view.state.doc.sliceString(from, to);
    safeDispatch(view,
        { from, to, insert: `[${selected}](https://)` },
        { anchor: from + 1, head: from + 1 + selected.length }
    );
    view.focus();
}

function insertImage(view) {
    if (!view) return;
    const { from, to } = safeSelection(view);
    const selected = view.state.doc.sliceString(from, to);
    safeDispatch(view,
        { from, to, insert: `![${selected}](https://)` },
        { anchor: from + 2, head: from + 2 + selected.length }
    );
    view.focus();
}

function insertInlineLaTeX(view) {
    if (!view) return;
    const { from, to } = safeSelection(view);
    const selected = view.state.doc.sliceString(from, to);
    safeDispatch(view,
        { from, to, insert: `$${selected}$` },
        { anchor: from + 1, head: from + 1 + selected.length }
    );
    view.focus();
}

function insertBlockLaTeX(view) {
    if (!view) return;
    const { from, to } = safeSelection(view);
    const selected = view.state.doc.sliceString(from, to);
    const insertText = `$$\n${selected}\n$$`;
    safeDispatch(view,
        { from, to, insert: insertText },
        { anchor: from + 3, head: from + 3 + selected.length }
    );
    view.focus();
}

function guideClick() {
    window.open('https://www.markdownguide.org/basic-syntax/', '_blank');
}

function CommunityAssetPickerButton({ type, getView }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const menuRef = useRef(null);
    const [rect, setRect] = useState(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleClick = id => {
        setOpen(false);
        const view = getView();
        if (!view) return;

        const { from, to } = safeSelection(view);
        // const selected = view.state.doc.sliceString(from, to);
        const token = `{${type}:${id}}`;
        safeDispatch(view,
            { from, to, insert: token },
            { anchor: from + token.length, head: from + token.length }
        );
        view.focus();
    }

    const handleOpen = () => {
        setOpen(o => !o);
        if (ref.current) setRect(ref.current.getBoundingClientRect());
    }

    return <div ref={ref} style={{ display: "inline", position: "relative" }}>
        <button className="editor-button-style" onClick={handleOpen} {...getGeneralTooltipProps(`Insert ${type}`)}>
            {type === "emote" ?
                <EmoteSolid size={16} /> :
                <StickerSolid size={16} />
            }
        </button>

        {open && (
            createPortal(
                <div ref={menuRef} style={{
                    position: "fixed", top: rect.bottom, left: rect.left, background: "var(--bg-secondary)",
                    border: "1px solid var(--secondary-border-color)", borderRadius: "8px",
                    zIndex: 10, padding: "0.2rem", boxSizing: "border-box", maxWidth: "90%"
                }}>
                    <CommunityAssetPicker type={type} onClick={handleClick} />
                </div>,
                document.body
            )
        )}
    </div>;
}

/* ---------- Component ---------- */

export default function MarkdownEditorMain({
    ref,
    value = '',
    onChange,
    placeholder = 'Write here...',
    short = false,
    mini = false
}) {
    const editorRef = useRef(null);
    const viewRef = useRef();
    const dataFacetExtension = useAutocompleteDataFacetExtension(viewRef);

    useImperativeHandle(ref, () => ({
        appendToEditor(text) {
            if (!viewRef.current) return;
            const end = viewRef.current.state.doc.length;
            viewRef.current.dispatch({
                changes: { from: end, insert: text },
                selection: { anchor: end + text.length }
            });
        }
    }))

    useEffect(() => {
        if (!editorRef.current) return;

        const state = EditorState.create({
            doc: value,
            extensions: [
                history(),
                keymap.of([
                    ...defaultKeymap,
                    ...historyKeymap
                ]),
                oneDark,
                EditorView.lineWrapping,
                markdownStyling,
                backspaceTriggersCompletion,
                tabAcceptsCompletion,
                dataFacetExtension,
                tokenAutocomplete,
                cmPlaceholder(`${placeholder} (Type { to start a token)`),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        onChange?.(update.state.doc.toString());
                    }
                }),
            ],
        });

        if (viewRef.current) {
            viewRef.current.destroy();
        }

        viewRef.current = new EditorView({
            state,
            parent: editorRef.current,
        });

        return () => {
            viewRef.current?.destroy();
            viewRef.current = null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataFacetExtension]);

    return (
        <div style={{ position: 'relative', border: "1px var(--secondary-border-color) solid", borderRadius: "4px" }}>
            {/* Toolbar */}
            <div>
                <DragContainer hintDistance={5}>
                    <div style={{ display: "flex", width: "max-content" }}>
                        <CommunityAssetPickerButton type={"emote"} getView={() => viewRef.current} />
                        <CommunityAssetPickerButton type={"sticker"} getView={() => viewRef.current} />
                        <button className="editor-button-style" {...getGeneralTooltipProps("Bold")} onClick={() => toggleWrap(viewRef.current, "**")}>
                            <FaBold />
                        </button>
                        <button className="editor-button-style" {...getGeneralTooltipProps("Italic")} onClick={() => toggleWrap(viewRef.current, "*")}>
                            <FaItalic />
                        </button>
                        <button className="editor-button-style" {...getGeneralTooltipProps("Inline Code")} onClick={() => toggleWrap(viewRef.current, "`")}>
                            <FaCode />
                        </button>
                        <button className="editor-button-style" {...getGeneralTooltipProps("Heading")} onClick={() => insertOrCycleHeading(viewRef.current)}>
                            <FaHeading />
                        </button>
                        <button className="editor-button-style" {...getGeneralTooltipProps("Blockquote")} onClick={() => insertQuote(viewRef.current)}>
                            <FaQuoteRight />
                        </button>
                        <button className="editor-button-style" {...getGeneralTooltipProps("Bulleted List")} onClick={() => insertBullet(viewRef.current)}>
                            <FaListUl />
                        </button>
                        <button className="editor-button-style" {...getGeneralTooltipProps("Numbered List")} onClick={() => insertNumbered(viewRef.current)}>
                            <FaListOl />
                        </button>
                        <button className="editor-button-style" {...getGeneralTooltipProps("Insert Link")} onClick={() => insertLink(viewRef.current)}>
                            <FaLink />
                        </button>
                        <button className="editor-button-style" {...getGeneralTooltipProps("Insert Image")} onClick={() => insertImage(viewRef.current)}>
                            <FaImage />
                        </button>
                        <button className="editor-button-style" {...getGeneralTooltipProps("Inline Math (LaTeX)")} onClick={() => insertInlineLaTeX(viewRef.current)}>
                            <span style={{ fontWeight: "bold", transform: "translateY(-2px)" }}>$</span>
                        </button>
                        <button className="editor-button-style" {...getGeneralTooltipProps("Math Block (LaTeX)")} onClick={() => insertBlockLaTeX(viewRef.current)}>
                            <span style={{ fontWeight: "bold", transform: "translateY(-2px)" }}>$$</span>
                        </button>
                        <button className="editor-button-style" {...getGeneralTooltipProps("Markdown Guide")} onClick={guideClick}>
                            <FaQuestionCircle />
                        </button>
                    </div>
                </DragContainer>
            </div>

            {/* Editor container */}
            <div
                ref={editorRef}
                id="editor-root"
                className="cm-editor-container"
                style={{
                    '--placeholder': `"${placeholder} (Type { to start a token)"`,
                    borderTop: '1px solid var(--secondary-border-color)',
                    // borderRadius: 4,
                    minHeight: short ? 100 : 200,
                    height: 'auto',
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 16,
                    overflow: 'visible',
                    cursor: 'text'
                }}
                onMouseDown={(e) => {
                    const view = viewRef.current;
                    if (!view) return;

                    // If the click target is NOT inside the cm-content element
                    const content = editorRef.current.querySelector(".cm-content");
                    if (!content.contains(e.target)) {
                        const end = view.state.doc.length;
                        view.dispatch({
                            selection: { anchor: end },
                            scrollIntoView: true
                        });
                        view.focus();
                        e.preventDefault();
                    }
                }}
            />
        </div>
    );
}
