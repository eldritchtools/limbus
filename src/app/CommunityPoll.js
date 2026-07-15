"use client";

import React, { useEffect, useState } from "react";

import styles from "./CommunityPoll.module.css";
import { getGeneralTooltipProps } from "./components/tooltips/GeneralTooltip";
import { useAuth } from "./database/authProvider";
import { getUserAnswer, submitPollVote } from "./database/polls";
import { triggerPollAnsweredEvent } from "./lib/gaEvents";

export default function CommunityPoll({ initPoll }) {
    const { user } = useAuth();
    const [poll, setPoll] = useState(initPoll);
    const [answer, setAnswer] = useState(0);
    const [mode, setMode] = useState(null);
    const [viewIndex, setViewIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(!poll || !user) return;
        const fetchAnswer = async () => {
            const answer = await getUserAnswer(user.id, poll.current.id);
            if(answer) setAnswer(answer);
            else setMode("vote");
        }
        
        fetchAnswer();
    }, [poll, user]);

    const current = viewIndex === 0 ? poll?.current : poll?.recent[viewIndex - 1];
    const timeString = current ? new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(current.start_ts)) : null;

    const voteProps = !user ? getGeneralTooltipProps("Login to vote") : {};

    const checkOption = i => (answer & (1 << i)) !== 0;
    const flipOption = (i, pre) => pre ^ (1 << i);

    const handleSubmit = async () => {
        if (answer === 0) return;
        setLoading(true);
        const result = (await submitPollVote(user.id, poll.current.id, answer))[0];
        setPoll(p => ({ ...p, current: { ...p.current, user_answer: answer, votes: result.votes, total_votes: result.total_votes } }));
        setMode("view");
        triggerPollAnsweredEvent();
        setLoading(false);
    }

    const finalMode = mode === "vote" ?
        (viewIndex > 0 ? "view" : "vote") : 
        (mode === "view" ? "view" : null)

    return <div style={{
        width: "100%", border: "1px var(--primary-border-color) solid", borderRadius: "12px", boxSizing: "border-box",
        padding: "0.5rem", display: "flex", flexDirection: "column"
    }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span 
                {...getGeneralTooltipProps("New poll questions go live at the game's daily reset and remain open for at least a few days.")} 
                className="hover-text title-text"
            >
                Community Poll
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.1rem" }}>
                <button className={styles.arrowButton} onClick={() => setViewIndex(p => p + 1)} disabled={!poll?.recent || viewIndex >= poll?.recent?.length}>◀</button>
                <span>{timeString}</span>
                <button className={styles.arrowButton} onClick={() => setViewIndex(p => p - 1)} disabled={viewIndex <= 0}>▶</button>
            </div>
        </div>

        {current && <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: "min(100%, 600px)", alignSelf: "center", alignItems: "stretch", gap: "0.5rem" }}>
            <span>{current.question}</span>

            {finalMode === "vote" && <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem" }}>
                {current.options.map((option, i) =>
                    <label key={i} style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                        {current.type === "single" ?
                            <input type="radio" value={i} checked={checkOption(i)} onChange={() => setAnswer(flipOption(i, 0))} /> :
                            <input type="checkbox" checked={checkOption(i)} onChange={() => setAnswer(flipOption(i, answer))} />
                        }
                        {option}
                    </label>
                )}
            </div>}

            {finalMode === "view" && <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "0.2rem" }}>
                {current.options.map((option, i) => {
                    const pct = current.total_votes ? (100 * current.votes[i] / current.total_votes) : 0;
                    return <React.Fragment key={i}>
                        <div style={{ textAlign: "start", fontWeight: checkOption(i) ? "bold": "none", gridColumn: "span 2" }}>
                            {option}{` (${current.votes[i]} vote${current.votes[i] !== 1 ? "s" : ""})`}
                        </div>

                        <div className={styles.bar}>
                            <div className={styles.barFill} style={{ width: `${pct}%` }} />
                        </div>
                        <div>{pct.toFixed(0)}%</div>
                    </React.Fragment>
                })}
            </div>}

            {!finalMode && <div className={styles.pollSummaryBar}>
                {current.options.map((option, i) => {
                    const pct = current.total_votes ? (100 * current.votes[i] / current.total_votes) : 0;
                    return <div key={i} {...getGeneralTooltipProps(`${option} - ${pct.toFixed(2)}%`)}
                        className={styles.segment} style={{ flex: `${pct+1}` }} />
                })}
            </div>}

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                {viewIndex === 0 && 
                    (finalMode === "vote" ?
                        <button onClick={handleSubmit} disabled={loading || !answer}>Submit</button> :
                        <button {...voteProps} onClick={() => setMode("vote")} disabled={!user}>{answer ? "Edit" : "Submit"} Vote</button>
                    )
                }
                {finalMode === "view" ?
                    null :
                    // <button>View Result History</button> :
                    <button onClick={() => setMode("view")}>View Results</button>
                }
            </div>
        </div>}
    </div>
}
