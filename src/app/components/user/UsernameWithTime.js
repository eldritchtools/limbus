import ReactTimeAgo from "react-time-ago";

import Username from "./Username";

import { isLocalId } from "@/app/database/localDB";

export default function UsernameWithTime({ data, scale = 1, clickable = true, includeUpdatedAt = true }) {
    return <div style={{ fontSize: `${scale}rem` }}>
        {!isLocalId(data.id) ?
            <span>by <Username username={data.username} flair={data.user_flair} clickable={clickable} /> • </span> :
            null
        }
        <ReactTimeAgo date={data.published_at ?? data.created_at} locale="en-US" timeStyle="mini" />
        {includeUpdatedAt && data.updated_at !== (data.published_at ?? data.created_at) ?
            <span> • Last edited <ReactTimeAgo date={data.updated_at} locale="en-US" timeStyle="mini" /></span> :
            null
        }
    </div>
}