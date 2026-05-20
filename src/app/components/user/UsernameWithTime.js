"use client";

import ReactTimeAgo from "react-time-ago";

import Username from "./Username";
import Avatar from "../icons/Avatar";

import { isLocalId } from "@/app/database/localDB";

export default function UsernameWithTime({ data, scale = 1, clickable = true, includeUpdatedAt = true, avatarId }) {
    return <div style={{ fontSize: `${scale}rem` }}>
        {!isLocalId(data.id) ?
            <span style={{display: "inline-flex", alignItems: "center", gap: "0.2rem"}}>by
                <Avatar avatarId={avatarId} size={24} style={{display: "inline"}} />
                <Username username={data.username} flair={data.user_flair} clickable={clickable} />
                •&nbsp;
            </span> :
            null
        }
        <ReactTimeAgo date={data.published_at ?? data.created_at} locale="en-US" timeStyle="mini" />
        {includeUpdatedAt && data.updated_at !== (data.published_at ?? data.created_at) ?
            <span> • Last edited <ReactTimeAgo date={data.updated_at} locale="en-US" timeStyle="mini" /></span> :
            null
        }
    </div>
}