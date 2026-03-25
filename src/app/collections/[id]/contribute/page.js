"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";

import MdPlan from "@/app/components/contentCards/MdPlan";
import TeamBuild from "@/app/components/contentCards/TeamBuild";
import MarkdownEditorWrapper from "@/app/components/markdown/MarkdownEditorWrapper";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import { useModal } from "@/app/components/modals/ModalProvider";
import { LoadingContentPageTemplate } from "@/app/components/pageTemplates/ContentPageTemplate";
import UsernameWithTime from "@/app/components/user/UsernameWithTime";
import { useAuth } from "@/app/database/authProvider";
import { getCollection, submitCollectionContribution } from "@/app/database/collections";
import { isLocalId } from "@/app/database/localDB";

export default function ContributeCollectionPage({ params }) {
    const { id } = React.use(params);
    const { user } = useAuth();
    const router = useRouter();
    const [collection, setCollection] = useState(null);
    const [targetType, setTargetType] = useState(null);
    const [targetData, setTargetData] = useState(null);
    const [note, setNote] = useState('');
    const [submitterNote, setSubmitterNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { isMobile } = useBreakpoint();
    const { openSelectBuildModal, openSelectMdPlanModal, closeModal } = useModal();

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

    const onSelectContent = (type, content) => {
        setTargetType(type);
        setTargetData(content);
        setMessage("");
        closeModal();
    }

    if (loading) return <LoadingContentPageTemplate />

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", containerType: "inline-size" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                Contributing to Collection
            </h2>
            <h2 style={{ display: "flex", fontSize: "1.2rem", fontWeight: "bold", alignItems: "center" }}>
                {collection.title}
            </h2>
            <UsernameWithTime data={collection} scale={.9} includeUpdatedAt={true} />
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
                <button onClick={() => openSelectBuildModal({ onSelectBuild: x => onSelectContent("build", x) })}>Select a build to contribute</button>
                <button onClick={() => openSelectMdPlanModal({ onSelectMdPlan: x => onSelectContent("md_plan", x) })}>Select an md plan to contribute</button>
            </div>

            {targetType && targetData ?
                targetType === "build" ?
                    <TeamBuild build={targetData} size={"M"} complete={false} clickable={false} /> :
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
    </div>
}
