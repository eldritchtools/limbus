"use client";

import ActionTemplate from "./ActionTemplate";
import { EditSolid } from "./Symbols";

import { contentConfig } from "@/app/lib/contentConfig";

export default function EditButton({ targetType, targetId, type = "button", iconSize }) {
    return <ActionTemplate type={type} href={`/${contentConfig[targetType]?.path ?? targetType}/${targetId}/edit`}>
        <EditSolid text={"Edit"} size={iconSize} />
    </ActionTemplate>
}
