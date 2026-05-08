"use client";

import { FaGithub } from "react-icons/fa";

import NoPrefetchLink from "../components/NoPrefetchLink";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import styles from "../components/user/userSocials.module.css";

export default function GithubButton() {
    const hrefValue = "https://github.com/eldritchtools/limbus"

    return <div {...getGeneralTooltipProps(`GitHub\n${hrefValue}`)}>
        <NoPrefetchLink className={styles.hoverableSocial} href={hrefValue}>
            <div className={styles.buttonSocial} style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <span style={{ fontSize: "1.25rem", color: "#000" }}><FaGithub /></span>
                <div style={{ fontSize: "1rem" }}>GitHub</div>
            </div>
        </NoPrefetchLink>
    </div>
}