"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useState } from "react";

import styles from "./TeamBuild.module.css";
import BuildIdentitiesGrid from "../build/BuildIdentitiesGrid";
import CommentButton from "../contentActions/CommentButton";
import LikeButton from "../contentActions/LikeButton";
import SaveButton from "../contentActions/SaveButton";
import HoverBlocker from "../HoverBlocker";
import Avatar from "../icons/Avatar";
import KeywordIcon from "../icons/KeywordIcon";
import StatusIcon from "../icons/StatusIcon";
import NoPrefetchLink from "../NoPrefetchLink";
import Tag from "../objects/Tag";
import UsernameWithTime from "../user/UsernameWithTime";

import { keywordIdMapping } from "@/app/database/keywordIds";
import { decodeBuildExtraOpts } from "@/app/lib/buildExtraOpts";


function getSizes(size, isMobile) {
    if (isMobile || size === "S") return { width: "300px", iconSize: 24, buttonIconSize: 16, scale: 0.175, maxRailIcons: 5 };
    if (size === "M") return { width: "460px", iconSize: 28, buttonIconSize: 20, scale: 0.275, maxRailIcons: 8 };
    if (size === "L") return { width: "640px", iconSize: 28, buttonIconSize: 20, scale: 0.375, maxRailIcons: 11 }
    return null;
}

export default function TeamBuild({ build, size, complete = true, clickable = true, styleOverride = {} }) {
    const [blockHover, setBlockHover] = useState(false);

    const addedIcons = [];

    const extraProps = {};
    if (build.extra_opts) {
        const extraOpts = decodeBuildExtraOpts(build.extra_opts, ["iu", "ai", "is"]);
        if (extraOpts.identityUpties) extraProps.identityUpties = extraOpts.identityUpties;
        if (extraOpts.addedIcons) addedIcons.push(...extraOpts.addedIcons);
        if (extraOpts.iconSwaps) extraProps.iconSwaps = extraOpts.iconSwaps;
    }

    const { isMobile } = useBreakpoint();
    const sizes = getSizes(size, isMobile);

    if (!sizes) return null;

    const icons = [...build.keyword_ids.map(x => ["kw", x]), ...addedIcons.map(x => ["st", x])].filter(([, x]) => x != "");

    const hiddenIcons = icons.length - sizes.maxRailIcons;

    const hoverWrap = x => <HoverBlocker setBlockHover={setBlockHover}>{x}</HoverBlocker>

    return <div className={`${styles.teamBuild} ${!blockHover ? styles.canHover : null}`} style={{ width: sizes.width, ...styleOverride }}>
        {clickable ? <NoPrefetchLink href={`/builds/${build.id}`} className={styles.teamBuildLink} /> : null}

        {icons.length > 0 ?
            <div className={styles.teamBuildIconRail}>
                {(hiddenIcons > 0 ? icons.slice(0, sizes.maxRailIcons - 1) : icons).map(
                    ([type, id]) => type === "kw" ?
                        <KeywordIcon key={id} id={keywordIdMapping[id]} size={sizes.iconSize} /> :
                        <StatusIcon key={id} id={id} style={{ width: `${sizes.iconSize}px` }} />
                )}
                {hiddenIcons > 0 ? <span style={{
                    width: sizes.iconSize, height: sizes.iconSize, display: "flex",
                    alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#7c6a55"
                }}>+{hiddenIcons + 1}</span> : null}
            </div> :
            null
        }

        {build.user_avatar_id &&
            <div className={styles.teamBuildAvatar}>
                <Avatar avatarId={build.user_avatar_id} size={32} />
            </div>
        }

        <div className={styles.teamBuildContent}>
            <div className={styles.teamBuildTitleContainer} style={{ maxWidth: build.user_avatar_id ? "calc(100% - 32px)" : "100%" }}>
                <div className={styles.teamBuildTitle}>{build.title}</div>
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
