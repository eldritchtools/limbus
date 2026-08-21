"use client";

import { useEffect, useState } from "react";

import Avatar from "../icons/Avatar";
import { LoadingContentPageTemplate } from "../pageTemplates/ContentPageTemplate";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { CREATOR_TAGS } from "@/app/creators/CreatorsDirectoryTab";
import { getCreatorTagVotes, submitCreatorTagVotes } from "@/app/database/creators";

export default function CreatorTagVoteModalContent({ creator, onSubmitted, onClose }) {
    const [tagIds, setTagIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const votes = await getCreatorTagVotes(creator.id);
                if (!cancelled) setTagIds(votes ?? []);
            } catch (error) {
                if (!cancelled) setError(error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => { cancelled = true; };
    }, [creator.id]);

    function toggleTag(tagId) {
        setTagIds(current =>
            current.includes(tagId)
                ? current.filter(id => id !== tagId)
                : [...current, tagId]
        );
    }

    async function submit() {
        setSubmitting(true);
        setError(null);

        try {
            await submitCreatorTagVotes(creator.id, tagIds);
            if (onSubmitted) onSubmitted();
            onClose();
        } catch (error) {
            setError(error);
        } finally {
            setSubmitting(false);
        }
    }

    return <div>
        <h2 style={{ textAlign: "center" }}>
            Creator Tags for <Avatar avatarId={creator.avatar_id} size={48} style={{ verticalAlign: "middle" }} /> {creator.name}
        </h2>

        <p style={{ textAlign: "center" }}>
            What type of content does this creator make?
            <br />
            Your selection represents the tags you think apply to this creator.
            <br />
            You can change your selection at any time.
        </p>

        {loading ? <LoadingContentPageTemplate /> :
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem" }}>
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
        }

        {error && <div className="error-text">{error.message}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
            <button onClick={onClose} disabled={submitting}>Cancel</button>

            <button onClick={submit} disabled={loading || submitting}>
                {submitting ? "Submitting..." : "Submit"}
            </button>
        </div>
    </div>
}
