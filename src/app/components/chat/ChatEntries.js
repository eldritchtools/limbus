import React, { useLayoutEffect, useRef, useState } from "react";

import styles from "./ChatWidget.module.css";
import MarkdownRenderer from "../markdown/MarkdownRenderer";
import { useSiteCustomization } from "../SiteCustomizationProvider";

function formatTime(date) {
    return new Intl.DateTimeFormat([], {
        hour: "numeric",
        minute: "2-digit"
    }).format(new Date(date));
}

function ChatEntry({ entry }) {
    if (entry.type === "message")
        return <div className={styles.messageEntry}>
            <MarkdownRenderer content={entry.text} />
        </div>

    if (entry.type === "author")
        return <div className={styles.authorEntry}>
            <span className={styles.authorName}>
                {entry.displayName}
            </span>
            {entry.isDeveloper > 0 &&
                <div style={{
                    height: "1rem", padding: "0 6px", borderRadius: "999px",
                    fontSize: "0.8rem", fontWeight: "bold",
                    background: "rgba(105, 159, 123, 0.75)", color: "var(--primary-text-color)"
                }}>
                    &nbsp;dev
                </div>
            }
            <span className={styles.authorTime}>
                &nbsp; {formatTime(entry.timestamp)}
            </span>
        </div>

    if (entry.type === "system")
        return <div className={styles.systemEntry}>
            <span style={{maxWidth: "85%"}}>{entry.text}</span>
        </div>
}

function NewMessagesDivider() {
    return (
        <div className={styles.newMessagesDivider}>
            <div className={styles.line} />
            <span>New Messages</span>
            <div className={styles.line} />
        </div>
    );
}

export default function ChatEntries({ entries, presenceNotifications }) {
    const { getCustomizationValue } = useSiteCustomization();
    const entriesRef = useRef(null);
    const [nearBottom, setNearBottom] = useState(true);
    const [missedMessages, setMissedMessages] = useState(0);
    const [newMessageIndex, setNewMessageIndex] = useState(null);

    function handleScroll() {
        const bottom = isNearBottom();
        setNearBottom(bottom);
        if (bottom) setMissedMessages(0);
    }

    function scrollToBottom() {
        const element = entriesRef.current;
        if (!element) return;

        element.scrollTop = element.scrollHeight;
    }

    function isNearBottom() {
        const element = entriesRef.current;
        if (!element) return true;

        return element.scrollHeight - element.scrollTop - element.clientHeight < 50;
    }

    useLayoutEffect(() => {
        if (nearBottom) {
            scrollToBottom();
            // setTimeout(() => {scrollToBottom()}, 1);
            setMissedMessages(0);
            setNewMessageIndex(null);
        } else {
            setMissedMessages(p => p + 1);
            if (!newMessageIndex) setNewMessageIndex(entries.length);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entries]);

    return <div className={styles.entriesContainer}>
        <div ref={entriesRef} onScroll={handleScroll} className={styles.entries}>
            {entries.map((entry, index) =>
                <React.Fragment key={entry.id}>
                    {newMessageIndex === index && <NewMessagesDivider />}
                    <ChatEntry entry={entry} />
                </React.Fragment>
            )}
        </div>

        {!nearBottom && (
            <button
                className={styles.jumpButton}
                onClick={() => {
                    scrollToBottom();
                    setMissedMessages(0);
                }}
            >
                ↓
                {missedMessages > 0 && ` ${missedMessages} new`}
            </button>
        )}

        {getCustomizationValue("showPresenceNotifications") &&
            <div className={styles.presenceNotifications}>
                {presenceNotifications.map(notification =>
                    <span key={notification.id} className={styles.presenceNotification}>
                        {notification.text}
                    </span>
                )}
            </div>
        }
    </div>
}