"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Concerns from "./Concerns";
import { sendFeedback } from "../database/feedback";

export default function FeedbackPage() {
    const [type, setType] = useState("bug");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const { isMobile } = useBreakpoint();

    const [startTime] = useState(Date.now());
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = e.target;

        if (form.company.value) return;
        if (Date.now() - startTime < 1000) return;

        if (!message.trim()) return;

        setLoading(true);

        try {
            await sendFeedback(type, message);
            setDone(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", gap: "2rem", alignItems: "center", paddingTop: isMobile ? "0rem" : "5rem" }}>
        <div style={{
            width: "100%",
            maxWidth: "min(95vw, 500px)",
            border: "1px solid #333",
            borderRadius: "0.75rem",
            padding: "1.5rem",
            background: "#111",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            boxSizing: "border-box"
        }}>
            <h1 style={{ marginTop: "0.25rem", marginBottom: "0.25rem" }}>Feedback</h1>
            <p style={{ marginBottom: "1rem", opacity: 0.7, fontSize: "0.9rem" }}>
                Found a bug or have a suggestion? Send it here. You can also send an email to contact@eldritchtools.com.
            </p>

            {!done ?
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <input type="text" name="company" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

                    <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.9rem" }}>
                        Type
                        <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: "0.4rem", borderRadius: "0.4rem", border: "1px solid #333", background: "#000", color: "#ddd" }}>
                            <option value="bug">Bug</option>
                            <option value="suggestion">Suggestion</option>
                            <option value="other">Other</option>
                        </select>
                    </label>

                    <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.9rem" }}>
                        Message
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="What would you like to report or suggest?"
                            rows={5}
                            style={{
                                padding: "0.5rem",
                                borderRadius: "0.4rem",
                                border: "1px solid #333",
                                background: "#000",
                                color: "#ddd",
                                resize: "vertical",
                            }}
                            required
                        />
                    </label>

                    <button type="submit" disabled={loading}>
                        {loading ? "Sending..." : "Send feedback"}
                    </button>

                    <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", opacity: 0.7 }}>
                        {"Feedback sent to this form will be read but not replied to. Use Discord if you'd like a response or updates."}
                    </p>
                </form> :
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: ".5rem", gap: "0.5rem" }}>
                    <span>Your feedback has been submitted. Thank you!</span>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                        <button onClick={() => router.back()}>Back to previous page</button>
                        <button onClick={() => {
                            setType("bug");
                            setMessage("");
                            setDone(false);
                        }}>Submit something else</button>
                    </div>
                </div>
            }
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
            <span>Before submitting a suggestion, consider checking if your concern has been answered below.</span>
            <Concerns />
        </div>
    </div>;
}