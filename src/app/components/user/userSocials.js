import { FaDiscord, FaEnvelope, FaGlobe, FaReddit, FaTwitch, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiBluesky, SiKofi, SiPatreon, SiSteam, SiTiktok } from "react-icons/si";

import styles from "./userSocials.module.css";
import NoPrefetchLink from "../NoPrefetchLink";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

export const socialsData = {
    "web": {
        label: "Website",
        validator: /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}([\/?#].*)?$/i,
        icon: FaGlobe,
        iconColor: "#6c757d",
        placeholder: "https://example.com",
        href: value => /^https?:\/\//i.test(value) ? value : `https://${value}`,
    },
    "email": {
        label: "Email",
        validator: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
        icon: FaEnvelope,
        iconColor: "#6c757d",
        placeholder: "you@example.com",
        href: value => `mailto:${value}`,
    },
    "discord-user": {
        label: "Discord Username",
        validator: /^.{2,32}$/i,
        icon: FaDiscord,
        iconColor: "#5865F2",
        placeholder: "username",
    },
    "discord-server": {
        label: "Discord Server",
        validator: /^(https:\/\/)?(www\.)?(discord\.gg|discord\.com\/invite)\/[a-zA-Z0-9]+$/i,
        icon: FaDiscord,
        iconColor: "#5865F2",
        placeholder: "discord.gg/abc123",
        href: value => value,
    },
    "youtube": {
        label: "YouTube",
        validator: /^@[A-Za-z0-9_-]+$/i,
        icon: FaYoutube,
        iconColor: "#FF0000",
        placeholder: "@handle",
        href: value => `https://www.youtube.com/${value}`,
    },
    "twitch": {
        label: "Twitch",
        validator: /^[a-zA-Z0-9_]{4,25}$/,
        icon: FaTwitch,
        iconColor: "#9146FF",
        placeholder: "username",
        href: value => `https://www.twitch.tv/${value}`,
    },
    "twitter": {
        label: "X (Twitter)",
        validator: /^[A-Za-z0-9_]{1,15}$/,
        icon: FaXTwitter,
        iconColor: "#000000",
        placeholder: "username",
        href: value => `https://twitter.com/${value}`,
    },
    "bluesky": {
        label: "Bluesky",
        validator: /^(@?[a-z0-9.-]+\.[a-z]{2,}|https:\/\/bsky\.app\/profile\/.+)$/i,
        icon: SiBluesky,
        iconColor: "#1C9CEA",
        placeholder: "@handle",
        href: value => `https://bsky.app/profile/${value.replace(/^@/, "")}`,
    },
    "reddit": {
        label: "Reddit",
        validator: /^([A-Za-z0-9_]{3,21})$/i,
        icon: FaReddit,
        iconColor: "#FF4500",
        placeholder: "username",
        href: value => `https://www.reddit.com/user/${value}`,
    },
    "tiktok": {
        label: "TikTok",
        validator: /^@?[A-Za-z0-9._]{2,24}$/i,
        icon: SiTiktok,
        iconColor: "#000000",
        placeholder: "@handle",
        href: value => `https://www.tiktok.com/${value.replace(/^@/, "")}`,
    },
    "steam": {
        label: "Steam",
        validator: /^(id|profiles)\/[A-Za-z0-9_-]+$/i,
        icon: SiSteam,
        iconColor: "#00adee",
        placeholder: "id/username or profiles/1234567890",
        href: value => `https://steamcommunity.com/${value}`,
    },
    "ko-fi": {
        label: "Ko-fi",
        validator: /^[A-Za-z0-9_-]+$/i,
        icon: SiKofi,
        iconColor: "#29abe0",
        placeholder: "username",
        href: value => `https://ko-fi.com/${value}`,
    },
    "patreon": {
        label: "Patreon",
        validator: /^[A-Za-z0-9_-]+$/i,
        icon: SiPatreon,
        iconColor: "#F96854",
        placeholder: "username",
        href: value => `https://www.patreon.com/${value}`,
    }
}

export function SocialIcon({ type, value, includeText, iconSize = 1, textSize = "1rem", link = false }) {
    const Icon = socialsData[type].icon;
    const hrefValue = socialsData[type].href && link ? socialsData[type].href(value) : null;

    const content = <div className={link && hrefValue ? styles.hoverableSocial : styles.social} style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
        <span style={{ fontSize: `${iconSize}rem`, color: socialsData[type].iconColor }}>
            <Icon />
        </span>
        {includeText ?
            <div style={{ fontSize: textSize }}>{value}</div>
            : null}
    </div>

    const tooltipText = socialsData[type].label + (hrefValue || value ? `\n${hrefValue ?? value}` : "");

    return <div {...getGeneralTooltipProps(tooltipText)}>
        {link && hrefValue ?
            <NoPrefetchLink className={styles.hoverableSocial} href={hrefValue}>{content}</NoPrefetchLink> :
            <div className={styles.social}>{content}</div>
        }
    </div>
}