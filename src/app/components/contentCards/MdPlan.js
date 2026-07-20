"use client";

import { useMemo, useState } from "react";

import NoPrefetchLink from "../NoPrefetchLink";
import styles from "./MdPlan.module.css";
import BuildIdentitiesGrid from "../build/BuildIdentitiesGrid";
import CommentButton from "../contentActions/CommentButton";
import LikeButton from "../contentActions/LikeButton";
import SaveButton from "../contentActions/SaveButton";
import HoverBlocker from "../HoverBlocker";
import Avatar from "../icons/Avatar";
import EgoIcon from "../icons/EgoIcon";
import Icon from "../icons/Icon";
import IdentityIcon from "../icons/IdentityIcon";
import KeywordIcon from "../icons/KeywordIcon";
import { AdversitiesPointTotal } from "../mdPlans/AdversitiesDisplay";
import Tag from "../objects/Tag";
import UsernameWithTime from "../user/UsernameWithTime";

import { keywordIdMapping } from "@/app/database/keywordIds";
import { decodeBuildExtraOpts } from "@/app/lib/buildExtraOpts";
import { mdDiffculties } from "@/app/lib/mirrorDungeon";

function IconGrid({ identityIds, egoIds }) {
    const display = useMemo(() => {
        const list = [];

        identityIds.forEach(id => {
            if (list.length >= 12) return;
            list.push(<IdentityIcon key={id} id={id} scale={0.175} style={{ borderRadius: "4px" }} />)
        });

        egoIds.forEach(id => {
            if (list.length >= 12) return;
            list.push(<EgoIcon key={id} id={id} type={"awaken"} scale={0.175} style={{ borderRadius: "4px" }} />)
        });

        return list;
    }, [identityIds, egoIds]);

    return <div className={styles.mdPlanIconGrid}>
        {display}
    </div>
}


export default function MdPlan({ plan, complete = true, clickable = true, styleOverride = {} }) {
    const [blockHover, setBlockHover] = useState(false);

    const displayComponent = useMemo(() => {
        if (plan.recommendation_mode === "list" || plan.recommendation_mode === "build")
            return <IconGrid identityIds={plan.identity_ids} egoIds={plan.ego_ids} scale={0.175} />;
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
            return <BuildIdentitiesGrid identityIds={identityIds} scale={0.175} {...extraProps} />
        }

        return null;
    }, [plan]);

    return <div className={`${styles.mdPlan} ${!blockHover ? styles.canHover : null}`} style={styleOverride}>
        {clickable ? <NoPrefetchLink href={`/md-plans/${plan.id}`} className={styles.mdPlanLink} /> : null}

        <div className={styles.mdPlanContent}>
            {plan.user_avatar_id &&
                <div className={styles.mdPlanAvatar}>
                    <Avatar avatarId={plan.user_avatar_id} size={32} />
                </div>
            }

            <div className={styles.mdPlanTitleContainer} style={{ maxWidth: plan.user_avatar_id ? "calc(100% - 32px)" : "100%" }}>
                <div className={styles.mdPlanTitle}>{plan.title}</div>
            </div>
            <HoverBlocker setBlockHover={setBlockHover}>
                <UsernameWithTime data={plan} scale={.8} includeUpdatedAt={false} />
            </HoverBlocker>
            <div>
                Difficulty: {mdDiffculties[plan.difficulty].name}
            </div>
            <div style={{ display: "flex" }}>
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <div className={styles.mdPlanCentered}>Keyword</div>
                    <div className={styles.mdPlanCentered}>
                        {plan.keyword_id ?
                            <KeywordIcon id={keywordIdMapping[plan.keyword_id]} size={24} /> :
                            <div />
                        }
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <div className={styles.mdPlanCentered}>Min Starlight</div>
                    <div className={styles.mdPlanCentered}>
                        <Icon path={"starlight"} style={{ width: "25px", height: "25px" }} />
                        {plan.cost}
                    </div>
                </div>
                {plan.difficulty === "E" && plan.adversities ?
                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <div className={styles.mdPlanCentered}>Adversity</div>
                        <div className={styles.mdPlanCentered}>
                            <AdversitiesPointTotal adversities={plan.adversities} />
                        </div>
                    </div> :
                    null
                }
            </div>
            {displayComponent}
            <div style={{ marginBottom: "0.2rem", alignSelf: "start" }}>
                {complete ? <div className={styles.mdPlanTags}>
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
                    <CommentButton targetType={"md_plan"} targetId={plan.id} count={plan.comment_count} type={"card-middle"} iconSize={20} shortText={true} />
                    <SaveButton targetType={"md_plan"} targetId={plan.id} type={"card-right"} iconSize={20} shortText={true} />
                </HoverBlocker>
            </div>
            : null}
    </div>
}
