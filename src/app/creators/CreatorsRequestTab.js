import { useState } from "react";

import { CREATOR_TAGS } from "./CreatorsDirectoryTab";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { submitCreatorRequest } from "../database/creators";

export default function CreatorsRequestTab() {
    const [requestType, setRequestType] = useState("add");
    const [name, setName] = useState("");
    const [links, setLinks] = useState([""]);
    const [tagIds, setTagIds] = useState([]);
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    function toggleTag(tagId) {
        setTagIds(current =>
            current.includes(tagId)
                ? current.filter(id => id !== tagId)
                : [...current, tagId]
        );
    }

    const handleSubmit = async () => {
        if (name.trim().length === 0) {
            setMessage("Missing creator name");
            return;
        }

        setSubmitting(true);
        setMessage(null);

        try {
            await submitCreatorRequest(
                requestType,
                name.trim(),
                links.map(link => link.trim()).filter(Boolean),
                tagIds.map(x => CREATOR_TAGS.find(y => y.id === x).label),
                note.trim() || null
            );

            setRequestType("add");
            setName("");
            setLinks([""]);
            setTagIds([]);
            setNote("");
            setMessage("Thanks for submitting!");
        } catch (error) {
            setMessage("Failed to submit request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem", width: "min(1200px, 100%)" }}>
        <span className="title-text">Request Type</span>
        <select value={requestType} onChange={event => setRequestType(event.target.value)}>
            <option value="add">Add</option>
            <option value="update">Update</option>
        </select>

        <span className="title-text">Creator Name</span>
        <input type="text" value={name} onChange={e => setName(e.target.value)} />

        <span className="title-text">Creator Links (optional)</span>
        {links.map((link, index) =>
            <div key={index} style={{ display: "flex", gap: "0.5rem" }}>
                <input type="url" value={link}
                    onChange={event => { setLinks(current => current.map((value, i) => i === index ? event.target.value : value)); }}
                />
                <button type="button" onClick={() => { setLinks(current => current.filter((_, i) => i !== index)); }}>−</button>
            </div>
        )}
        <button type="button" onClick={() => setLinks(current => [...current, ""])}>+ Add Link</button>

        <span className="title-text">Suggested Tags (optional)</span>
        <span className="sub-text">These tags are what the creator will start with, but users can still vote to change them. I will manually check the creator&apos;s content to confirm the starting tags. If the existing tags don&apos;t cover the creator, you can suggest new ones under Notes or through the Feedback page.</span>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem", width: "100%" }}>
            {CREATOR_TAGS.map(tag => {
                const tooltipProps = tag.tooltip
                    ? {
                        ...getGeneralTooltipProps(tag.tooltip),
                        className: "hover-text",
                    }
                    : {};

                return <label key={tag.id} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <input type="checkbox" checked={tagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
                    <span {...tooltipProps}>{tag.label}</span>
                </label>
            })}
        </div>

        <span className="title-text">Notes (optional)</span>
        <textarea value={note} onChange={event => setNote(event.target.value)} />

        <button onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting" : "Submit"}</button>
        {message && <span>{message}</span>}
    </div>
}
