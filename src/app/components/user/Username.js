import styles from "./Username.module.css";
import NoPrefetchLink from "../NoPrefetchLink";

export default function Username({ username, flair, style = {}, clickable = true, guardedLinks }) {
    const component = clickable ?
        <NoPrefetchLink href={`/profiles/${username}`} className={styles.usernameLink} style={style} guarded={guardedLinks}>
            {username}
        </NoPrefetchLink> :
        <span className={styles.username}>{username}</span>

    if (flair)
        return <span style={{ whiteSpace: "wrap" }}>
            {component} <em style={{ color: "var(--secondary-text-color)" }}>({flair})</em>
        </span>
    return component;
}