import { ChevronDownIcon, PlayCircleIcon } from "@heroicons/react/24/solid";
import { useEffect, useMemo, useState } from "react";

import styles from "./ClearRecordsTab.module.css";
import { DeleteSolid, EditSolid } from "../components/contentActions/Symbols";
import MarkdownEditorWrapper from "../components/markdown/MarkdownEditorWrapper";
import MarkdownRenderer from "../components/markdown/MarkdownRenderer";
import NoPrefetchLink from "../components/NoPrefetchLink";
import { HorizontalDivider } from "../components/objects/Dividers";
import ImageCarousel from "../components/objects/ImageCarousel";
import { ImageUploader } from "../components/objects/ImageUploader";
import NumberInput from "../components/objects/NumberInput";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import Username from "../components/user/Username";
import { useAuth } from "../database/authProvider";
import { createClearRecord, deleteClearRecord, fetchClearRecords, fetchUserClearRecords, updateClearRecord } from "../database/encounters";

const cellStyle = { borderTop: "1px var(--primary-border-color) solid", padding: "0.5rem", textAlign: "center" };

function isValidVideoUrl(url) {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace("www.", "");

        const isYouTube = ["youtube.com", "youtu.be", "m.youtube.com"].includes(host);
        const isVimeo = ["vimeo.com", "player.vimeo.com"].includes(host);

        if (!isYouTube && !isVimeo) return false;
        if (!parsed.pathname || parsed.pathname === "/") return false;

        return true;
    } catch {
        return false;
    }
}

function formatDateString(isoString) {
    if (!isoString) return null;

    const date = new Date(isoString);

    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "shortOffset"
    });
}

function RecordsTable({ records, startPosition, editable = false, triggerEdit, triggerDelete }) {
    const [expanded, setExpanded] = useState(null);

    const rows = useMemo(() => records.map((record, i) =>
        <tr key={record.id}>
            {!editable && <td style={cellStyle}>{i + startPosition}</td>}
            <td style={cellStyle}><Username username={record.username} /></td>
            <td style={cellStyle}>{record.turn_count}</td>
            <td style={cellStyle}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ImageCarousel imageIds={record.image_ids} maxImages={3} mini={true} />
                </div>
            </td>
            <td style={cellStyle}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <span>Submitted: {formatDateString(record.created_at)}</span>
                    {record.created_at !== record.updated_at && <span>Edited: {formatDateString(record.updated_at)}</span>}
                </div>
            </td>
            <td style={cellStyle}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    <div style={{ display: "flex", gap: "0", justifyContent: "center" }}>
                        <button
                            {...getGeneralTooltipProps(expanded === record.id ? "Collapse" : "Expand")}
                            className={styles.actionButton}
                            onClick={() => setExpanded(expanded === record.id ? null : record.id)}
                        >
                            <ChevronDownIcon style={{ width: "20px", height: "20px", transform: expanded === record.id ? "rotate(180deg)" : null }} />
                        </button>
                        {record.video_url && <NoPrefetchLink
                            {...getGeneralTooltipProps("Video Link")}
                            className={styles.actionButton} href={record.video_url}
                        >
                            <PlayCircleIcon style={{ width: "20px", height: "20px" }} />
                        </NoPrefetchLink>}
                    </div>
                    <div style={{ display: "flex", gap: "0", justifyContent: "center" }}>
                        {editable &&
                            <button
                                {...getGeneralTooltipProps("Edit")}
                                className={styles.actionButton}
                                onClick={() => triggerEdit(record)}
                            >
                                <EditSolid size={20} />
                            </button>
                        }
                        {editable &&
                            <button
                                {...getGeneralTooltipProps("Delete")}
                                className={styles.actionButton}
                                onClick={() => triggerDelete(record)}
                            >
                                <DeleteSolid size={20} />
                            </button>
                        }
                    </div>
                </div>
            </td>
        </tr>
    ), [records, startPosition, editable, expanded, triggerEdit, triggerDelete]);

    const finalRows = useMemo(() => {
        if (!expanded) return rows;

        const index = records.findIndex(x => x.id === expanded);
        if (index === -1) return rows;

        const record = records[index];

        const buildsStr = record.team_data?.builds ?
            record.team_data.builds.reduce((acc, build) => {
                if (build.type === "teamCode") return acc + "Code: " + build.code + "\n";
                if (build.type === "buildId") return acc + "Build: {build:" + build.id + "}\n";
                return acc;
            }, "")
            : null;

        return rows.toSpliced(
            index + 1,
            0,
            <tr key={`${expanded}-ex`}>
                <td colSpan="100%">
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {buildsStr && <>
                            <span style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "0.5rem" }}>Teams:</span>
                            <MarkdownRenderer content={buildsStr} />
                        </>}
                        {record.notes && record.notes.length > 0 && <>
                            <span style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "0.5rem" }}>Notes:</span>
                            <MarkdownRenderer content={record.notes} />
                        </>}
                        {record.image_ids && record.image_ids.length > 0 && <>
                            <span style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "0.5rem" }}>Images:</span>
                            <ImageCarousel imageIds={record.image_ids} maxImages={3} />
                        </>}
                    </div>
                </td>
            </tr>
        )
    }, [records, rows, expanded]);

    return <div style={{ overflowX: "auto", maxWidth: "min(100%, 1600px)" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "min(100%, 1600px)" }}>
            <thead>
                <tr style={{ height: "1.25rem" }}>
                    {!editable && <th>Position</th>}
                    <th>User</th>
                    <th>Turns</th>
                    <th>Images</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {finalRows}
            </tbody>
        </table>
    </div>
}

export default function ClearRecordsTab({ siteId, type }) {
    const { user, profile } = useAuth();
    const [difficulty, setDifficulty] = useState(type === "reflectrial" ? "normal" : null);
    const [page, setPage] = useState(1);
    const [clearRecords, setClearRecords] = useState([]);
    const [clearsLoading, setClearsLoading] = useState(true);
    const [userRecords, setUserRecords] = useState([]);
    const [userClearsLoading, setUserClearsLoading] = useState(false);
    const [record, setRecord] = useState(null);
    const [editing, setEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!siteId) return;
        const fetchRecords = async () => {
            setClearsLoading(true);
            const records = await fetchClearRecords({ encounterId: siteId, difficulty: difficulty, page });
            setClearRecords(records);
            setClearsLoading(false);
        }

        fetchRecords();
    }, [siteId, page, difficulty]);

    useEffect(() => {
        if (!user || !siteId) return;
        const fetchRecords = async () => {
            setUserClearsLoading(true);
            const records = await fetchUserClearRecords({ encounterId: siteId, userId: user.id, difficulty: difficulty });
            setUserRecords(records);
            setUserClearsLoading(false);
        }

        fetchRecords();
    }, [user, siteId, difficulty]);

    const triggerEdit = (record) => {
        setRecord(record);
        setEditing(true);
        setMessage("");
    }


    const triggerDelete = async (record) => {
        await deleteClearRecord(record.id);
        setUserRecords(p => p.filter(x => x.id !== record.id));
    }

    const handleSubmitStart = () => {
        if(!user || !profile) return;

        setRecord({
            turn_count: 0,
            username: profile?.username,
            team_data: {},
            video_url: "",
            notes: "",
            image_ids: []
        });

        setEditing(true);
        setMessage("");
    }

    const editingComponent = useMemo(() => {
        if (!editing || !record) return null;

        const cancelSubmit = () => {
            setRecord(null);
            setEditing(false);
        }

        const handleSubmit = async () => {
            if (record.video_url.trim().length !== 0 && !isValidVideoUrl(record.video_url.trim())) {
                setMessage("Invalid video url.");
                return;
            }

            if (record.turn_count === 0) {
                setMessage("Turn count cannot be 0.");
                return;
            }

            if (record.id) {
                setSubmitting(true);
                const result = await updateClearRecord(record.id, difficulty, record.turn_count, record.team_data, record.video_url.trim(), record.notes, record.image_ids);
                setUserRecords(p => p.map(r => r.id === record.id ? record : r));
                setRecord(null);
                setEditing(false);
                setSubmitting(false);
            } else {
                setSubmitting(true);
                const result = await createClearRecord(siteId, difficulty, record.turn_count, record.team_data, record.video_url.trim(), record.notes, record.image_ids);
                setUserRecords(p => [{ id: result, ...record }, ...p]);
                setRecord(null);
                setEditing(false);
                setSubmitting(false);
            }
        }

        return <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                <span style={{ fontSize: "1.2rem" }} >Turn Count:</span>
                <NumberInput min={1} value={record.turn_count} onChange={x => setRecord(p => ({ ...p, turn_count: x }))} style={{ width: "5ch", textAlign: "center" }} />
            </div>

            {/* <span style={{ fontSize: "1.2rem" }} >Teams</span>
                <span className="sub-text">
                    Include information about the teams you used.
                </span>
                {
                    record.teamData.builds.map((build, i) => <div key={i} style={{display: "flex", gap: "0.5rem"}}>

                        <select value={build.type} 
                            onChange={x => setRecord(p => ({...p, teamData: {...p.teamData, builds: 
                                p.teamData.builds.map((buildInner, j) => i === j ? {...buildInner, type: x} : buildInner)
                            }}))}
                        >
                            <option key={"build"} value={"build"}>Build</option>
                            <option key={"code"} value={"code"}>Team Code</option>
                            <option key={"text"} value={"text"}>Text</option>
                        </select>

                        {
                            build.type === "build" ?
                                <>

                                </>
                        }
                    </div>)
                } */}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <span style={{ fontSize: "1.2rem" }} >Notes</span>
                <div className={{ maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}>
                    <MarkdownEditorWrapper value={record.notes} onChange={x => setRecord(p => ({ ...p, notes: x }))} placeholder={"Add any notes for the clear here..."} />
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <span style={{ fontSize: "1.2rem" }} >Images</span>
                <span className="sub-text">
                    Attach clear screens or other related screenshots.
                </span>
                <ImageUploader onImageUploaded={imageId => setRecord(p => ({ ...p, image_ids: [...p.image_ids, imageId] }))} />
                <ImageCarousel imageIds={record.image_ids} onRemoveImage={id => setRecord(p => ({ ...p, image_ids: p.image_ids.filter(x => x !== id) }))} editable={true} markdownCopyable={false} />
            </div>

            <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                <span style={{ fontSize: "1.2rem" }} >Video Link:</span>
                <input value={record.video_url} onChange={e => setRecord(p => ({ ...p, video_url: e.target.value }))} placeholder="Paste a url to a clear video (optional)" style={{ width: "30ch" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <button onClick={cancelSubmit} disabled={submitting}>Cancel</button>
                <button onClick={handleSubmit} disabled={submitting}>Submit</button>
                {message.length > 0 && <span>{message}</span>}
            </div>
        </div>
    }, [siteId, difficulty, record, editing, submitting, message]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%" }}>
        <span className="sub-text">
            Clear records are not pre-vetted. Submissions that are obviously fake may be deleted without warning. This feature is still a work-in-progress, so there may be some issues.
        </span>
        {
            type === "reflectrial" ? <div style={{ display: "flex", gap: "1rem" }}>
                <div className={`tab-header ${difficulty === "normal" ? "active" : ""}`} onClick={() => setDifficulty("normal")}>Normal</div>
                <div className={`tab-header ${difficulty === "hard" ? "active" : ""}`} onClick={() => setDifficulty("hard")}>Hard</div>
            </div> :
                null
        }

        {clearsLoading ?
            <span>Loading...</span> :
            (
                clearRecords.length === 0 ?
                    <span>No clear records. Be the first to submit one!</span> :
                    <RecordsTable records={clearRecords} startPosition={(page - 1) * 50 + 1} />
            )
        }

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", alignSelf: "end" }}>
            <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            {page}
            <button className="page-button" disabled={clearRecords.length < 50} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>

        {user && <>
            <HorizontalDivider />
            <h3 style={{ margin: 0 }}>My Clear Records</h3>
            {userClearsLoading ?
                <span>Loading...</span> :
                (
                    userRecords.length === 0 ?
                        <span>No clear records. Submit your first clear!</span> :
                        <RecordsTable records={userRecords} editable={true} triggerEdit={triggerEdit} triggerDelete={triggerDelete} />
                )
            }

            {editing ?
                editingComponent :
                <div>
                    <button onClick={handleSubmitStart}>Submit a clear</button>
                </div>
            }
        </>}
    </div>
}