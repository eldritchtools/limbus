"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useState } from "react";

import styles from "./TeamBuild.module.css";
import BuildIdentitiesGrid from "../build/BuildIdentitiesGrid";
import CommentButton from "../contentActions/CommentButton";
import LikeButton from "../contentActions/LikeButton";
import SaveButton from "../contentActions/SaveButton";
import HoverBlocker from "../HoverBlocker";
import KeywordIcon from "../icons/KeywordIcon";
import NoPrefetchLink from "../NoPrefetchLink";
import Tag from "../objects/Tag";
import UsernameWithTime from "../user/UsernameWithTime";

import { keywordIdMapping } from "@/app/database/keywordIds";
import { decodeBuildExtraOpts } from "@/app/lib/buildExtraOpts";


function getSizes(size, isMobile) {
    if (isMobile || size === "S") return { width: "300px", iconSize: 24, buttonIconSize: 16, scale: 0.175, maxRailIcons: 5 };
    if (size === "M") return { width: "460px", iconSize: 28, buttonIconSize: 20, scale: 0.275, maxRailIcons: 7 };
    if (size === "L") return { width: "640px", iconSize: 28, buttonIconSize: 20, scale: 0.375, maxRailIcons: 10 }
    return null;
}

export default function TeamBuild({ build, size, complete = true, clickable = true }) {
    const [blockHover, setBlockHover] = useState(false);

    const extraProps = {};
    if (build.extra_opts) {
        const extraOpts = decodeBuildExtraOpts(build.extra_opts, ["iu"])
        if (extraOpts.identityUpties) extraProps.identityUpties = extraOpts.identityUpties;
    }

    const { isMobile } = useBreakpoint();
    const sizes = getSizes(size, isMobile);

    if (!sizes) return null;

    const hiddenIcons = build.keyword_ids.length - sizes.maxRailIcons;

    const hoverWrap = x => <HoverBlocker setBlockHover={setBlockHover}>{x}</HoverBlocker>

    return <div className={`${styles.teamBuild} ${!blockHover ? styles.canHover : null}`} style={{ width: sizes.width }}>
        {clickable ? <NoPrefetchLink href={`/builds/${build.id}`} className={styles.teamBuildLink} /> : null}

        {build.keyword_ids.length > 0 ?
            <div className={styles.teamBuildIconRail}>
                {build.keyword_ids.slice(0, sizes.maxRailIcons).map(id => <KeywordIcon key={id} id={keywordIdMapping[id]} size={sizes.iconSize} />)}
                {hiddenIcons > 0 ? <span style={{
                    width: sizes.iconSize, height: sizes.iconSize, display: "flex",
                    alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#7c6a55"
                }}>+{hiddenIcons}</span> : null}
            </div> :
            null
        }

        <div className={styles.teamBuildContent}>
            <div className={styles.teamBuildTitleContainer}>
                <h2 className={styles.teamBuildTitle}>{build.title}</h2>
            </div>
            <HoverBlocker setBlockHover={setBlockHover}>
                <UsernameWithTime data={build} scale={.8} includeUpdatedAt={false} />
            </HoverBlocker>
            <div style={{ alignSelf: "center" }}>
                <BuildIdentitiesGrid
                    identityIds={build.identity_ids}
                    scale={sizes.scale}
                    deploymentOrder={build.deployment_order}
                    activeSinners={build.active_sinners}
                    {...extraProps}
                />
            </div>
            {complete ? <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                {build.tags.map((t, i) => t ?
                    <HoverBlocker key={i} setBlockHover={setBlockHover}>
                        <Tag tag={t} type={"build"} />
                    </HoverBlocker> :
                    null
                )}
            </div> : null}
        </div>
        {complete ?
            <div className={styles.teamBuildButtonsContainer}>
                {hoverWrap(<LikeButton targetType={"build"} targetId={build.id} likeCount={build.like_count} type={"card-left"} iconSize={sizes.buttonIconSize} />)}
                {hoverWrap(<CommentButton targetType={"build"} targetId={build.id} count={build.comment_count} type={"card-middle"} iconSize={sizes.buttonIconSize} />)}
                {hoverWrap(<SaveButton targetType={"build"} targetId={build.id} type={"card-right"} iconSize={sizes.buttonIconSize} />)}
            </div>
            : null}
    </div>
}
