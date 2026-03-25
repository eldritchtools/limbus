"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useEffect, useState } from "react";

import MdPlan from "@/app/components/contentCards/MdPlan";
import TeamBuild from "@/app/components/contentCards/TeamBuild";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import DropdownButton from "@/app/components/objects/DropdownButton";
import ContentPageTemplate, { LoadingContentPageTemplate } from "@/app/components/pageTemplates/ContentPageTemplate";
import Username from "@/app/components/user/Username";
import { getCollection } from "@/app/database/collections";
import { isLocalId } from "@/app/database/localDB";
import { contentConfig } from "@/app/lib/contentConfig";
import useLocalState from "@/app/lib/useLocalState";

function ItemList({ items, viewMode, isMobile }) {
    if (viewMode === "grid" || isMobile) {
        const size = isMobile ? "320px" : "480px";
        return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${size}, 1fr))`, gap: "1rem" }}>
            {items.map(item =>
                <div key={item.data.id} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%" }}>
                    {item.type === "build" ?
                        <TeamBuild build={item.data} size={"M"} /> :
                        item.type === "md_plan" ?
                            <MdPlan plan={item.data} /> :
                            null
                    }
                    {item.submitted_by ?
                        <div style={{ display: "flex", gap: "0.2rem" }}>
                            Submitted by: <Username username={item.submitted_by_username} flair={item.submitted_by_flair} />
                        </div> :
                        null
                    }
                    {item.note.length > 0 ?
                        <div style={{ alignSelf: "center", marginTop: "0.5rem" }}>
                            <MarkdownRenderer content={item.note} />
                        </div> :
                        null
                    }
                </div>
            )}
        </div>
    } else if (viewMode === "detail") {
        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {items.map(item =>
                <div key={item.data.id} style={{
                    display: "flex", flexDirection: isMobile ? "column" : "row",
                    gap: "1rem", alignItems: isMobile ? "center" : "start",
                    width: isMobile ? "320px" : "95%", alignSelf: "center"
                }}>
                    {item.type === "build" ?
                        <TeamBuild build={item.data} size={"M"} /> :
                        item.type === "md_plan" ?
                            <MdPlan plan={item.data} /> :
                            null
                    }
                    {item.note.length > 0 ?
                        <div style={{
                            display: "flex", flexDirection: "column",
                            width: "100%", alignSelf: "start",
                            paddingTop: isMobile ? "0" : "1rem"
                        }}>
                            {item.submitted_by ?
                                <div style={{ display: "flex", gap: "0.2rem" }}>
                                    Submitted by: <Username username={item.submitted_by_username} flair={item.submitted_by_flair} />
                                </div> :
                                null
                            }
                            <MarkdownRenderer content={item.note} />
                        </div> :
                        null
                    }
                </div>
            )}
        </div>
    }
}

export default function CollectionPage({ params }) {
    const { id } = React.use(params);
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isMobile } = useBreakpoint();

    const [viewMode, setViewMode] = useLocalState("collectionsViewMode", "detail");

    useEffect(() => {
        if (loading) {
            const handleCollection = x => {
                setCollection(x);
                setLoading(false);
            }

            if (isLocalId(id)) {
                contentConfig.collections.local.get(Number(id)).then(handleCollection);
            } else {
                getCollection(id).then(handleCollection);
            }
        }
    }, [id, loading]);

    if (loading || viewMode === null) return <LoadingContentPageTemplate />

    return <ContentPageTemplate
        targetType={"collection"} targetId={id} content={collection}
        actions={["like", "save", "edit", "delete", "contribute", "review"]}
    >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>Description</span>

            <div>
                <MarkdownRenderer content={collection.body} />
            </div>

            <div style={{ border: "1px #777 solid" }} />

            {isMobile ? null :
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    View Mode:
                    <DropdownButton value={viewMode} setValue={setViewMode} options={{ "detail": "Detailed", "grid": "Grid" }} />
                </div>
            }

            <ItemList items={collection.items.filter(x => x.data)} viewMode={viewMode} isMobile={isMobile} />
        </div>

    </ContentPageTemplate>
}
