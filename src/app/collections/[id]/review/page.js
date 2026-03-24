"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import MarkdownRenderer from "@/app/components/Markdown/MarkdownRenderer";
import ReactTimeAgo from "react-time-ago";
import { isLocalId } from "@/app/utils";
import MarkdownEditorWrapper from "@/app/components/Markdown/MarkdownEditorWrapper";
import Username from "@/app/components/Username";
import { useAuth } from "@/app/database/authProvider";
import { approveCollectionSubmission, getCollection, getCollectionSubmissions, rejectCollectionSubmission, rejectCollectionSubmissionsForTarget } from "@/app/database/collections";
import { useBreakpoint } from "@eldritchtools/shared-components";
import BuildEntry from "@/app/components/BuildEntry";
import "./Submission.css";
import NoPrefetchLink from "@/app/NoPrefetchLink";
import MdPlan from "@/app/components/MdPlan";

function Submission({ submission, submissionIds, inList, handleApprove, handleReject, approved, rejected, submitting }) {
    const [editing, setEditing] = useState(false);
    const [note, setNote] = useState(submission.note);

    const style = useMemo(() => {
        if (approved) return { backgroundColor: "#052e16", border: "1px solid #166534" };
        if (rejected) return { backgroundColor: "#2c0a0a", border: "1px solid #7f1d1d" };
        return {}
    }, [approved, rejected]);

    if (editing) {
        return <div className="submission-editing" style={style}>
            <div>
                Submitted by <Username username={submission.submitter.username} flair={submission.submitter.flair} clickable={false} />
            </div>
            <span style={{ fontSize: "1.2rem" }}>Description</span>
            <MarkdownEditorWrapper value={note} onChange={setNote} />
            <span style={{ fontSize: "1.2rem" }}>Submitter Note</span>
            <div>
                {submission.submitter_note}
            </div>
            <span style={{ fontSize: "1rem", color: "#aaa" }}>
                On approving a submission, the item will be added to your collection and all other submissions for the same item will be rejected. The description and ordering of items can be adjusted by editing the collection afterwards.
            </span>
            <div style={{ display: "flex" }}>
                <button disabled={submitting} onClick={() => { handleApprove(submission.submission_id, note, submissionIds); setEditing(false); }}>Approve</button>
                <button disabled={submitting} onClick={() => { handleReject(submission.submission_id); setEditing(false); }}>Reject</button>
            </div>
        </div>
    } else {
        return <div className="submission" style={style} onClick={() => { if (!inList && !approved && !rejected) setEditing(true) }}>
            <div>
                Submitted by <Username username={submission.submitter.username} flair={submission.submitter.flair} clickable={false} />
            </div>
            <span style={{ fontSize: "1.2rem" }}>Description</span>
            <MarkdownRenderer content={note} />
            <span style={{ fontSize: "1.2rem" }}>Submitter Note</span>
            <div>
                {submission.submitter_note}
            </div>
            {approved || rejected ?
                null :
                <div style={{ display: "flex" }}>
                    <button disabled={submitting} onClick={(e) => { e.stopPropagation(); handleReject(submission.submission_id); }}>Reject</button>
                </div>
            }
        </div>
    }
}

function SubmissionSet({ type, data, submissions, inList, handleApprove, handleReject, handleRejectAll, approvedIds, rejectedIds, submitting }) {
    const submissionIds = useMemo(() => submissions.map(x => x.submission_id), [submissions]);
    const anyApproved = useMemo(() => submissions.find(x => approvedIds.has(x.submission_id)) !== undefined, [submissions, approvedIds]);

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
            {type === "build" ?
                <BuildEntry build={data} size={"M"} complete={false} clickable={false}/> :
                type === "md_plan" ?
                    <MdPlan plan={data} complete={false} clickable={false}/> :
                    null
            }
            {inList ?
                <span style={{ fontSize: "1rem", color: "#aaa" }}>
                    This item is already in this collection. Submissions can only be rejected.
                </span> :
                null
            }
            <div>
                <button disabled={submitting || anyApproved} onClick={() => handleRejectAll(type, data.id, submissionIds)}>
                    Reject All Submissions for this Item
                </button>
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {submissions.map(submission =>
                <Submission
                    key={submission.submission_id}
                    submission={submission}
                    submissionIds={submissionIds}
                    inList={inList}
                    handleApprove={handleApprove}
                    handleReject={handleReject}
                    approved={approvedIds.has(submission.submission_id)}
                    rejected={rejectedIds.has(submission.submission_id)}
                    submitting={submitting}
                />
            )}
        </div>
    </div>
}

export default function ReviewCollectionPage({ params }) {
    const { id } = React.use(params);
    const [collection, setCollection] = useState(null);
    const [collectionLoading, setCollectionLoading] = useState(true);
    const [submissions, setSubmissions] = useState(null);
    const [submissionsLoading, setSubmissionsLoading] = useState(true);
    const [setIndex, setSetIndex] = useState(0);
    const [approved, setApproved] = useState(new Set());
    const [rejected, setRejected] = useState(new Set());
    const [submitting, setSubmitting] = useState(false);

    const { user } = useAuth();
    const router = useRouter();
    const { isMobile } = useBreakpoint();

    useEffect(() => {
        if (isLocalId(id) || !user) router.back();

        const handleCollection = collection => {
            if (!collection) router.back();
            if (collection.username) {
                setCollection(collection);
                setCollectionLoading(false);
            }
        }

        getCollection(id).then(handleCollection).catch(_err => {
            router.push(`/collections/${id}`);
        });

        const handleSubmissions = submissions => {
            setSubmissions(submissions.filter(x => x.data));
            setSubmissionsLoading(false);
        }

        getCollectionSubmissions(id).then(handleSubmissions).catch(_err => {
            router.push(`/collections/${id}`);
        });
    }, [id, router, user]);

    const handleApprove = async (submissionId, note, submissionIds) => {
        setSubmitting(true);
        await approveCollectionSubmission(submissionId, note);
        setApproved(p => new Set([...p, submissionId]));
        setRejected(p => new Set([...p, ...submissionIds.filter(x => x !== submissionId)]));
        setSubmitting(false);
    }

    const handleReject = async (submissionId) => {
        setSubmitting(true);
        await rejectCollectionSubmission(submissionId);
        setRejected(p => new Set([...p, submissionId]));
        setSubmitting(false);
    }

    const handleRejectAll = async (targetType, targetId, submissionIds) => {
        setSubmitting(true);
        await rejectCollectionSubmissionsForTarget(id, targetType, targetId);
        setRejected(p => new Set([...p, ...submissionIds]));
        setSubmitting(false);
    }

    const submissionsSorted = useMemo(() => {
        if (!collection || !submissions) return {};
        const sorted = {};
        submissions.forEach(submission => {
            if (submission.target_id in sorted) {
                const { target_type: type, data: rem, ...rest } = submission;
                sorted[submission.target_id].submissions.push(rest);
            } else {
                const { target_type: type, data: data, ...rest } = submission;
                sorted[submission.target_id] = {
                    type: type,
                    data: data,
                    submissions: [rest],
                    inList: collection.items.find(x => x.data.id === submission.target_id) !== undefined
                };
            }
        });
        return Object.entries(sorted);
    }, [collection, submissions]);

    return collectionLoading || submissionsLoading ?
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
            Loading...
        </div> :
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", containerType: "inline-size" }}>
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                    Reviewing Submissions for Collection
                </h2>
                <h2 style={{ display: "flex", fontSize: "1.2rem", fontWeight: "bold", alignItems: "center" }}>
                    {collection.title}
                </h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: "#ddd" }}>
                        <span>by <Username username={collection.username} flair={collection.user_flair} /> • </span>
                        <ReactTimeAgo date={collection.published_at ?? collection.created_at} locale="en-US" timeStyle="mini" />
                        {collection.updated_at !== (collection.published_at ?? collection.created_at) ?
                            <span> • Last edited <ReactTimeAgo date={collection.updated_at} locale="en-US" timeStyle="mini" /></span> :
                            null}
                    </div>
                </div>
            </div>

            <div style={{ height: "0.5rem" }} />
            <div style={{ display: "flex", flexDirection: "column", width: isMobile ? "100%" : "95%", alignSelf: "center", marginBottom: "1rem", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", paddingRight: "0.5rem", gap: "0.5rem", width: "100%" }}>
                    <span style={{ fontSize: "1.2rem" }}>Collection Description</span>
                    <div className={{ maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}>
                        <div>
                            <MarkdownRenderer content={collection.body} />
                        </div>
                    </div>
                </div>

                <div style={{ border: "1px #777 solid" }} />

                {submissionsSorted.length > 0 ? <>
                    <span style={{ fontSize: "1rem", color: "#aaa" }}>
                        Clicking on a submission will let you edit the description before approving it. Approving a submission will automatically reject all other submissions for the same build.
                    </span>

                    <div style={{ alignSelf: "center" }}>
                        <button onClick={() => setSetIndex(p => p - 1)} disabled={setIndex === 0}>Previous pending submission</button>
                        <button onClick={() => setSetIndex(p => p + 1)} disabled={setIndex === submissionsSorted.length - 1}>Next pending submission</button>
                    </div>

                    <SubmissionSet
                        key={submissionsSorted[setIndex][0]}
                        type={submissionsSorted[setIndex][1].type}
                        data={submissionsSorted[setIndex][1].data}
                        submissions={submissionsSorted[setIndex][1].submissions}
                        inList={submissionsSorted[setIndex][1].inList}
                        handleApprove={handleApprove}
                        handleReject={handleReject}
                        handleRejectAll={handleRejectAll}
                        approvedIds={approved}
                        rejectedIds={rejected}
                        submitting={submitting}
                    />
                </> :
                    <span style={{ fontSize: "1rem", color: "#aaa", alignSelf: "center" }}>
                        No pending submissions.
                    </span>
                }
                <div style={{ border: "1px #777 solid" }} />
            </div>

            <div>
                <NoPrefetchLink href={`/collections/${id}`} className="toggle-button" style={{ color: "#ddd", textDecoration: "none", fontSize: "1.2rem" }}>
                    Return to collection
                </NoPrefetchLink>
            </div>
        </div>
}
