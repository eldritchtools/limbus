"use client";

import { useMemo } from "react";

import styles from "./Tag.module.css";
import NoPrefetchLink from "../NoPrefetchLink";

export default function Tag({ tag, type }) {
    const path = useMemo(() => {
        const search = new URLSearchParams({ tags: [tag] });
        return `/${type}/search?${search.toString()}`;
    }, [tag, type]);

    return <NoPrefetchLink className={styles.tag} href={path}>{tag}</NoPrefetchLink>
}