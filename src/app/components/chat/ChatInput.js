import { useEffect, useRef, useState } from "react";

import styles from "./ChatWidget.module.css";
import MarkdownEditorWrapper from "../markdown/MarkdownEditorWrapper";

export default function ChatInput({ disabled, sendMessage, editorViewRef }) {
    const [text, setText] = useState("");
    const textRef = useRef();

    useEffect(() => {
        textRef.current = text;
    }, [text]);

    async function onSubmit() {
        if (disabled) return false;

        const trimmed = textRef.current.trim();
        if (!trimmed) return false;

        try {
            await sendMessage(trimmed);
            return true;
        } catch(err) {
            return false;
        }
    }

    return <div className={styles.input}>
        <MarkdownEditorWrapper
            value={text}
            onChange={setText}
            onSubmit={onSubmit}
            autoFocus={true}
            mini={true} short={true}
        />
    </div>
}