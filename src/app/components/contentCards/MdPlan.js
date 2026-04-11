"use client";

import { useMemo, useState } from "react";

import NoPrefetchLink from "../NoPrefetchLink";
import styles from "./MdPlan.module.css";
import BuildIdentitiesGrid from "../build/BuildIdentitiesGrid";
import CommentButton from "../contentActions/CommentButton";
import LikeButton from "../contentActions/LikeButton";
import SaveButton from "../contentActions/SaveButton";
import HoverBlocker from "../HoverBlocker";
import EgoIcon from "../icons/EgoIcon";
import Icon from "../icons/Icon";
import IdentityIcon from "../icons/IdentityIcon";
import KeywordIcon from "../icons/KeywordIcon";
import Tag from "../objects/Tag";
import UsernameWithTime from "../user/UsernameWithTime";

import { keywordIdMapping } from "@/app/database/keywordIds";
import { decodeBuildExtraOpts } from "@/app/lib/buildExtraOpts";
import { mdDiffculties } from "@/app/lib/mirrorDungeon";

function IconGrid({ identityIds, egoIds, scale }) {
    const size = scale * 256;
    const display = useMemo(() => {
        const list = [];

        identityIds.forEach(id => {
            if (list.length >= 12) return;
            list.push(<div key={id} style={{ width: "100%", height: "100%" }}>
                <IdentityIcon id={id} scale={scale} style={{ borderRadius: "4px" }} />
            </div>)
        });

        egoIds.forEach(id => {
            if (list.length >= 12) return;
            list.push(<div key={id} style={{ width: "100%", height: "100%" }}>
                <EgoIcon id={id} type={"awaken"} scale={scale} style={{ borderRadius: "4px" }} />
            </div>)
        });

        return list;
    }, [identityIds, egoIds, scale]);

    return <div style={{
        display: "grid", gridTemplateColumns: `repeat(6, ${size}px)`, gridTemplateRows: `repeat(2, ${size}px)`,
        width: `${size * 6 + 10}px`, alignItems: "center", justifyItems: "center", gap: "2px"
    }}>
        {display}
    </div>
}


export default function MdPlan({ plan, complete = true, clickable = true }) {
    const [blockHover, setBlockHover] = useState(false);

    // const { isMobile } = useBreakpoint();
    const width = "300px";
    const scale = 0.175;

    const displayComponent = useMemo(() => {
        if (plan.recommendation_mode === "list" || plan.recommendation_mode === "build")
            return <IconGrid identityIds={plan.identity_ids} egoIds={plan.ego_ids} scale={scale} />;
        if (plan.recommendation_mode === "specbuild") {
            const extraProps = {};
            const extraOpts = decodeBuildExtraOpts(plan.extra_opts, ["do", "as", "iu"])
            extraProps.deploymentOrder = extraOpts.deploymentOrder ?? [];
            extraProps.activeSinners = extraOpts.activeSinners ?? 7;
            if (extraOpts.identityUpties) extraProps.identityUpties = extraOpts.identityUpties.map(uptie => uptie === "" ? 4 : uptie);
            const identityIds = Array.from({ length: 12 }, () => "");
            plan.identity_ids.forEach(id => {
                if (!id) return;
                identityIds[Math.floor(id / 100) % 100 - 1] = id;
            })
            return <BuildIdentitiesGrid identityIds={identityIds} scale={scale} {...extraProps} />
        }

        return null;
    }, [plan, scale]);

    return <div className={`${styles.mdPlan} ${!blockHover ? styles.canHover : null}`} style={{ width: width }}>
        {clickable ? <NoPrefetchLink href={`/md-plans/${plan.id}`} className={styles.mdPlanLink} /> : null}

        <div className={styles.mdPlanContent} style={{ width: width }}>
            <h2 className={styles.mdPlanTitle}>{plan.title}</h2>
            <HoverBlocker setBlockHover={setBlockHover}>
                <UsernameWithTime data={plan} scale={.8} includeUpdatedAt={false} />
            </HoverBlocker>
            <div>
                Difficulty: {mdDiffculties[plan.difficulty].name}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>Keyword</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>Min Starlight</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {plan.keyword_id ?
                        <KeywordIcon id={keywordIdMapping[plan.keyword_id]} size={24} /> :
                        <div />
                    }
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon path={"starlight"} style={{ width: "25px", height: "25px" }} />
                    {plan.cost}
                </div>
            </div>
            {displayComponent}
            <div style={{ marginBottom: "0.2rem", alignSelf: "start" }}>
                {complete ? <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    {plan.tags.map((t, i) => t ?
                        <HoverBlocker key={i} setBlockHover={setBlockHover}>
                            <Tag tag={t} type={"md_plan"} />
                        </HoverBlocker> :
                        null
                    )}
                </div> : null}
            </div>
        </div>
        {complete ?
            <div className={styles.mdPlanButtonsContainer}>
                <HoverBlocker setBlockHover={setBlockHover}>
                    <LikeButton targetType={"md_plan"} targetId={plan.id} likeCount={plan.like_count} type={"card-left"} iconSize={20} shortText={true} />
                    <CommentButton targetPath={"md_plan"} targetId={plan.id} count={plan.comment_count} type={"card-middle"} iconSize={20} shortText={true} />
                    <SaveButton targetType={"md_plan"} targetId={plan.id} type={"card-right"} iconSize={20} shortText={true} />
                </HoverBlocker>
            </div>
            : null}
    </div>
}
