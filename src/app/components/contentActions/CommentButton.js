"use client";

import ActionTemplate from "./ActionTemplate";
import { CommentSolid } from "./Symbols";

import { contentConfig } from "@/app/lib/contentConfig";

export default function CommentButton({ targetType, targetId, count, type = "button", iconSize, shortText = false }) {
    const text = shortText ? `${count}` : count === 1 ? "1 Comment" : `${count} Comments`;

    return <ActionTemplate type={type} href={`/${contentConfig[targetType]?.path ?? targetType}/${targetId}#comments`}>
        <CommentSolid text={text} size={iconSize} />
    </ActionTemplate>
}
