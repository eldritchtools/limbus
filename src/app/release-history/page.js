"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useMemo, useState } from "react";

import { useEgosWithUpcoming, useIdentitiesWithUpcoming } from "../components/dataHooks/upcoming";
import EgoIcon from "../components/icons/EgoIcon";
import IdentityIcon from "../components/icons/IdentityIcon";
import NoPrefetchLink from "../components/NoPrefetchLink";
import DragContainer from "../components/objects/DragContainer";
import CommentSection from "../components/pageTemplates/CommentSection";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { commentsTargetIds } from "../lib/commentsTargetIds";

export default function UpdateHistoryPage() {
    const [identities, identitiesLoading] = useIdentitiesWithUpcoming();
    const [egos, egosLoading] = useEgosWithUpcoming();
    const { isMobile } = useBreakpoint();
    const [limit, setLimit] = useState(10);

    const latest = useMemo(() => {
        if (identitiesLoading || egosLoading) return [];
        const dates = {};

        Object.values(identities).forEach(x => {
            if (!(x.date in dates)) dates[x.date] = [x];
            else dates[x.date].push(x);
        });
        Object.values(egos).forEach(x => {
            if (!(x.date in dates)) dates[x.date] = [x];
            else dates[x.date].push(x);
        });

        return Object.keys(dates).sort((a, b) => {
            if (a.includes("?")) return -1;
            if (b.includes("?")) return 1;
            return b.localeCompare(a);
        }).slice(0, limit).map(x => [x, dates[x]]);
    }, [identities, identitiesLoading, egos, egosLoading, limit]);

    const latestSize = isMobile ? "96px" : "128px";

    if (identitiesLoading || egosLoading) return <LoadingContentPageTemplate />

    return <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "min(100%, 512px)" }}>
            <h1 className="title-text">Release History</h1>

            {latest.map(([date, list]) =>
                <div key={date} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "start" }}>
                    <div>{date}</div>
                    <DragContainer>
                        <div style={{ display: "flex", gap: "1px" }}>
                            {list.map(obj => obj.id[0] === "1" ?
                                (obj.upcoming ?
                                    <div key={obj.id} style={{ width: latestSize, height: latestSize }}>
                                        <IdentityIcon identity={obj} uptie={4} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none", borderRadius: "8px" }} />
                                    </div> :
                                    <NoPrefetchLink key={obj.id} href={`/identities/${obj.id}`}>
                                        <div style={{ width: latestSize, height: latestSize }}>
                                            <IdentityIcon identity={obj} uptie={4} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none", borderRadius: "8px" }} />
                                        </div>
                                    </NoPrefetchLink>
                                ) :
                                (obj.upcoming ?
                                    <div key={obj.id} style={{ width: latestSize, height: latestSize }}>
                                        <EgoIcon ego={obj} type={"awaken"} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none", borderRadius: "8px" }} />
                                    </div> :
                                    <NoPrefetchLink key={obj.id} href={`/egos/${obj.id}`}>
                                        <div style={{ width: latestSize, height: latestSize }}>
                                            <EgoIcon ego={obj} type={"awaken"} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none", borderRadius: "8px" }} />
                                        </div>
                                    </NoPrefetchLink>
                                )
                            )}
                        </div>
                    </DragContainer>
                </div>
            )}

            <button onClick={() => setLimit(p => p + 10)}>
                Show More
            </button>
        </div>

        <div style={{ flex: 1 }}>
            <CommentSection targetType={"fixed"} targetId={commentsTargetIds.upcoming} />
        </div>
    </div>
}