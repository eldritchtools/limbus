"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";

import NoPrefetchLink from "../NoPrefetchLink";
import styles from "./MdPlan.module.css";
import CommentButton from "../contentActions/CommentButton";
import LikeButton from "../contentActions/LikeButton";
import SaveButton from "../contentActions/SaveButton";
import HoverBlocker from "../HoverBlocker";
import Icon from "../icons/Icon";
import KeywordIcon from "../icons/KeywordIcon";
import Tag from "../objects/Tag";
import UsernameWithTime from "../user/UsernameWithTime";

import { keywordIdMapping } from "@/app/database/keywordIds";
import { mdDiffculties } from "@/app/lib/mirrorDungeon";

export default function MdPlan({ plan, complete = true, clickable = true }) {
    const [blockHover, setBlockHover] = useState(false);

    const { isMobile } = useBreakpoint();
    const width = isMobile ? "175px" : "250px";

    return <div className={`${styles.mdPlan} ${!blockHover ? styles.canHover : null}`} style={{ width: width }}>
        {clickable ? <NoPrefetchLink href={`/md-plans/${plan.id}`} className={styles.mdPlanLink} /> : null}

        <div className={styles.mdPlanContent} style={{ width: width }}>
            <h2 className={styles.mdPlanTitle}>{plan.title}</h2>
            <HoverBlocker setBlockHover={setBlockHover}>
                <UsernameWithTime data={plan} scale={.8} includeUpdatedAt={false} />
            </HoverBlocker>
            <div>
                Difficulty: {mdDiffculties[plan.difficulty]}
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
                    <Icon path={"starlight"} />
                    {plan.cost}
                </div>
            </div>
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
