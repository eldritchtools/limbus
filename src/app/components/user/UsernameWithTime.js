"use client";

import ReactTimeAgo from "react-time-ago";

import Username from "./Username";
import FollowButton from "../contentActions/FollowButton";
import Avatar from "../icons/Avatar";

import { isLocalId } from "@/app/database/localDB";

export default function UsernameWithTime({ data, scale = 1, clickable = true, includeUpdatedAt = true, avatarId, withFollowButton, guardedLinks }) {
    return <div style={{ display: "inline", fontSize: `${scale}rem`, verticalAlign: "middle" }}>
        {!isLocalId(data.id) &&
            <>
                by&nbsp;
                {avatarId && <>
                    <Avatar avatarId={avatarId} size={24} style={{ display: "inline", verticalAlign: "-0.5rem" }} />&nbsp;
                </>}
                <Username username={data.username} flair={data.user_flair} clickable={clickable} guardedLinks={guardedLinks} />
                {withFollowButton && <FollowButton targetId={data.user_id} style={{verticalAlign: "-0.2rem"}} />}
                &nbsp;•&nbsp;
            </>
        }
        <ReactTimeAgo date={data.published_at ?? data.created_at} locale="en-US" timeStyle="mini" />
        {includeUpdatedAt && data.updated_at !== (data.published_at ?? data.created_at) &&
            <span> • Last edited <ReactTimeAgo date={data.updated_at} locale="en-US" timeStyle="mini" /></span>
        }
    </div>
}