"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import SelectBuildModal from "@/app/components/SelectBuildModal";
import MarkdownRenderer from "@/app/components/Markdown/MarkdownRenderer";
import ReactTimeAgo from "react-time-ago";
import { isLocalId } from "@/app/utils";
import MarkdownEditorWrapper from "@/app/components/Markdown/MarkdownEditorWrapper";
import Username from "@/app/components/Username";
import { useAuth } from "@/app/database/authProvider";
import { getCollection, submitCollectionContribution } from "@/app/database/collections";
import { useBreakpoint } from "@eldritchtools/shared-components";
import BuildEntry from "@/app/components/BuildEntry";
import MdPlan from "@/app/components/MdPlan";
import SelectMdPlanModal from "@/app/components/SelectMdPlanModal";

export default function ContributeCollectionPage({ params }) {
    const { id } = React.use(params);
    const [collection, setCollection] = useState(null);
    const [targetType, setTargetType] = useState(null);
    const [targetData, setTargetData] = useState(null);
    const [note, setNote] = useState('');
    const [submitterNote, setSubmitterNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const [selectBuildOpen, setSelectBuildOpen] = useState(false);
    const [selectMdPlanOpen, setSelectMdPlanOpen] = useState(false);
    const { isMobile } = useBreakpoint();

    useEffect(() => {
        if (isLocalId(id) || !user) router.back();

        const handleCollection = collection => {
            if (!collection || collection.submission_mode !== "open") router.back();
            if (collection.username) {
                setCollection(collection);
                setLoading(false);
            }
        }

        getCollection(id).then(handleCollection).catch(_err => {
            router.push(`/collections/${id}`);
        });
    }, [id, router, user]);

    const handleSubmit = async () => {
        if (!targetData) {
            setMessage("An item must be selected.")
            return;
        }
        setSubmitting(true);

        const result = await submitCollectionContribution(user.id, id, targetType, targetData.id, note, submitterNote);
        if (result === "Success")
            router.push(`/collections/${id}`);
        else {
            setMessage(result);
            setSubmitting(false);
        }
    }

    const alreadyInList = useMemo(() => {
        if (!targetData) return false;
        return collection.items.find(x => x.data.id === targetData.id) !== undefined;
    }, [collection, targetData]);

    return loading ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
        Loading...
    </div> : <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", containerType: "inline-size" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                Contributing to Collection
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

            <div style={{ display: "flex", gap: "0.25rem" }} >
                <button onClick={() => setSelectBuildOpen(true)}>Select a build to contribute</button>
                <button onClick={() => setSelectMdPlanOpen(true)}>Select an md plan to contribute</button>
            </div>

            {targetType && targetData ?
                targetType === "build" ?
                    <BuildEntry build={targetData} size={"M"} complete={false} clickable={false} /> :
                    targetType === "md_plan" ?
                        <MdPlan plan={targetData} complete={false} clickable={false} /> :
                        null
                : null
            }
            {alreadyInList ?
                <span>Warning: This is already included in this collection and cannot be submitted.</span> :
                null
            }

            <span style={{ fontSize: "1.2rem" }}>Description:</span>
            <span style={{ fontSize: "1rem", color: "#aaa" }}>
                Description to display on the collection if approved. The owner may decide to edit this.
            </span>
            <div className={{ maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}>
                <MarkdownEditorWrapper value={note} onChange={setNote} placeholder={"Describe your contribution here..."} />
            </div>

            <span style={{ fontSize: "1.2rem" }}>Submitter Note:</span>
            <span style={{ fontSize: "1rem", color: "#aaa" }}>
                Anything else you may want to convey to the owner for this contribution. This will not be displayed on the collection if the submission is approved.
            </span>
            <textarea value={submitterNote} style={{ width: "min(100%, 85vw)", height: "5rem" }} onChange={e => setSubmitterNote(e.target.value)} />
        </div>

        <span style={{ fontSize: "1rem", color: "#aaa" }}>
            Contributions cannot be edited once submitted and you will not be allowed to submit the same item until it is approved or rejected. Please make sure the details are final before submitting.
        </span>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button style={{ padding: "0.5rem", fontSize: "1.2rem" }} onClick={() => handleSubmit()} disabled={submitting || alreadyInList}>Submit</button>
            <button style={{ padding: "0.5rem", fontSize: "1.2rem" }} onClick={() => router.back()} disabled={submitting}>Cancel</button>
            <span>{message}</span>
        </div>

        <SelectBuildModal
            isOpen={selectBuildOpen}
            onClose={() => setSelectBuildOpen(false)}
            onSelectBuild={build => {
                setTargetType("build");
                setTargetData(build);
                setMessage("");
                setSelectBuildOpen(false);
            }}
        />
        
        <SelectMdPlanModal
            isOpen={selectMdPlanOpen}
            onClose={() => setSelectMdPlanOpen(false)}
            onSelectMdPlan={plan => {
                setTargetType("md_plan");
                setTargetData(plan);
                setMessage("");
                setSelectMdPlanOpen(false);
            }}
        />
    </div>
}
