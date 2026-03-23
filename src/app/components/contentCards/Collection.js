import styles from "./Collection.module.css";
import NoPrefetchLink from "../NoPrefetchLink";
import MdPlan from "./MdPlan";
import BuildEntry from "./TeamBuild";
import CommentButton from "../contentActions/CommentButton";
import ContributeButton from "../contentActions/ContributeButton";
import LikeButton from "../contentActions/LikeButton";
import ReviewButton from "../contentActions/ReviewButton";
import SaveButton from "../contentActions/SaveButton";
import HoverBlocker from "../HoverBlocker";
import Tag from "../objects/Tag";
import UsernameWithTime from "../user/UsernameWithTime";

import { useAuth } from "@/app/database/authProvider";

export default function Collection({ collection, complete = true }) {
    const [blockHover, setBlockHover] = useState(false);
    const { user } = useAuth();

    const hoverWrap = x => <HoverBlocker setBlockHover={setBlockHover}>{x}</HoverBlocker>

    return <div className={`${styles.collection} ${!blockHover ? styles.canHover : null}`}>
        <NoPrefetchLink href={`/collections/${collection.id}`} className={styles.collectionLink} />

        <div className={styles.collectionContent}>
            <h3 style={{ margin: 0 }}>{collection.title}</h3>
            {hoverWrap(<UsernameWithTime data={collection} scale={.8} includeUpdatedAt={false} />)}
            <div style={{ color: "#aaa", fontSize: "0.9rem", alignSelf: "start", textAlign: "start" }}>
                {collection.short_desc}
            </div>
            {collection.items.length > 0 ?
                <div style={{ paddingLeft: "1rem", overflowX: "auto", scrollbarWidth: "thin", width: "100%" }}>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        {collection.items.map(item =>
                            item.type === "build" ?
                                <HoverBlocker key={item.data.id} setBlockHover={setBlockHover}>
                                    <BuildEntry build={item.data} size={"S"} complete={false} />
                                </HoverBlocker> :
                                item.type === "md_plan" ?
                                    <HoverBlocker key={item.data.id} setBlockHover={setBlockHover}>
                                        <MdPlan key={item.data.id} plan={item.data} complete={false} />
                                    </HoverBlocker> :
                                    null
                        )}
                    </div>
                </div> :
                <div style={{ textAlign: "center" }}>
                    No builds found...
                </div>
            }
            {collection.tags.length > 0 ?
                <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    Tags: {collection.tags.map((t, i) => t ?
                        <HoverBlocker key={i} setBlockHover={setBlockHover}>
                            <Tag tag={t} type={"collection"} />
                        </HoverBlocker> :
                        null
                    )}
                </div> :
                null
            }
            {complete ?
                <div style={{ display: "flex", gap: "0.5rem", pointerEvents: "all" }}>
                    {hoverWrap(<LikeButton targetType={"collection"} targetId={collection.id} likeCount={collection.like_count} iconSize={20} />)}
                    {hoverWrap(<CommentButton targetType={"collection"} targetId={collection.id} count={collection.comment_count} iconSize={20} />)}
                    {hoverWrap(<SaveButton targetType={"collection"} targetId={collection.id} iconSize={20} />)}
                    {collection.submission_mode === "open" ? hoverWrap(<ContributeButton collectionId={collection.id} iconSize={20} />) : null}
                    {user?.id === collection.user_id ? hoverWrap(<ReviewButton collectionId={collection.id} iconSize={20} />) : null}
                </div> :
                null
            }
        </div>
    </div>
}