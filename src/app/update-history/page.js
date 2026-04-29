"use client";

import React from "react";

import { useData } from "../components/DataProvider";
import { useModal } from "../components/modals/ModalProvider";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";

export default function UpdateHistoryPage() {
    const [updates, updatesLoading] = useData("updates_index");
    const { openUpdateHistoryModal } = useModal();

    if (updatesLoading) return <LoadingContentPageTemplate />

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "column", width: "100%", alignItems: "start" }}>
        <h3>Update History</h3>
        <span style={{fontSize: "0.9rem", color: "#aaa"}}>
            This update history may not always be complete or up to date. Join the discord if you want to be notified when new updates are pushed to the site.
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", width: "100%", gap: ".2rem", marginTop: "0.5rem" }}>
            {updates.map((update, i) => <React.Fragment key={i}>
                <span style={{ color: "#aaa", fontSize: "0.9rem" }}>{update.date}</span>
                <span className="text-link"
                    style={{ marginLeft: "0.3rem", textAlign: "start", fontWeight: "normal" }}
                    onClick={() => openUpdateHistoryModal({date: update.date, title: update.title, path: update.path})} >
                    {update.title}
                </span>
            </React.Fragment>)}
        </div>
    </div>
}