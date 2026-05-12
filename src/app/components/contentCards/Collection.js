"use client";

import { useEffect, useRef, useState } from "react";

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
    const { user } = useAuth();
    const [blockHover, setBlockHover] = useState(false);
    const [isScrollable, setIsScrollable] = useState(false);

    const ref = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const moved = useRef(false);

    const scrollProps = {
        ref,

        onPointerDown: (e) => {
            if (!ref.current) return;

            isDragging.current = true;
            moved.current = false;

            ref.current.setPointerCapture(e.pointerId);

            document.body.style.userSelect = "none";

            startX.current = e.clientX;
            scrollLeft.current = ref.current.scrollLeft;
        },

        onPointerMove: (e) => {
            if (!isDragging.current || !ref.current) return;

            const x = e.clientX;
            const walk = (x - startX.current) * 1.5;
            if (Math.abs(walk) > 5) moved.current = true;

            ref.current.scrollLeft = scrollLeft.current - walk;
        },

        onPointerUp: (e) => {
            isDragging.current = false;
            document.body.style.userSelect = "";

            if (ref.current) ref.current.releasePointerCapture(e.pointerId);
        },

        onPointerCancel: () => {
            isDragging.current = false;
            document.body.style.userSelect = "";
        },

        onClickCapture: (e) => {
            if (moved.current) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    };

    useEffect(() => {
        const checkScrollable = () => {
            if (!ref.current) return;
            setIsScrollable(ref.current.scrollWidth > ref.current.clientWidth);
        };

        checkScrollable();
        const resizeObserver = new ResizeObserver(checkScrollable);
        if (ref.current) resizeObserver.observe(ref.current);
        return () => resizeObserver.disconnect();
    }, []);

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
                <div
                    className={`${styles.scrollContainer} ${isScrollable ? styles.scrollable : ""} ${isScrollable ? styles.hoverHint : ""}`}
                    style={{ paddingLeft: "1rem", overflowX: "auto", width: "100%" }}
                    {...scrollProps}
                >
                    <div className={styles.track} style={{ display: "flex" }}>
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
            {collection.tags.length > 0 && complete ?
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