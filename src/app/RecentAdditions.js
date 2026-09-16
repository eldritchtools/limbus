"use client";

import { useState } from "react";

import HoverBlocker from "./components/HoverBlocker";
import NoPrefetchLink from "./components/NoPrefetchLink";
import styles from "./homepage.module.css";

// function NewContentWithClears({ wrapLink }) {
//     const name = "Mnestic Experience Reflectrial";
//     const category = "reflectrial";
//     const encounter = "9-5-2";

//     const clearsPath = `/encounters?category=${category}&encounter=${encounter}&tab=clears`;
//     const buildPath = `/builds/new?tag=${category}-${encounter}`;

//     return <div>
//         The {name} is out! You can submit your clears or check out other clears on its {wrapLink("Encounters Page", clearsPath)}. You can also submit builds for it using its corresponding tag or by clicking {wrapLink("here", buildPath)}.
//     </div>
// }

export default function RecentAdditions() {
    const [blockHover, setBlockHover] = useState(false);
    const [open, setOpen] = useState(false);

    const wrapLink = (text, href) =>
        <HoverBlocker setBlockHover={setBlockHover}>
            <NoPrefetchLink className="text-link" href={href}>
                {text}
            </NoPrefetchLink>
        </HoverBlocker>

    return <div
        className={`${styles.recentAdditions} ${!blockHover && !open ? styles.canHover : null}`}
        onClick={!blockHover && !open ? () => setOpen(p => !p) : null}
    >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem" }}>
            <span className="title-text">What&apos;s New</span>
            <span className="sub-text">Most notable changes in case you missed them.</span>
        </div>

        {/* <NewContentWithClears wrapLink={wrapLink} /> */}

        <div>
            <ul style={{ lineHeight: "1.3", marginTop: "0.5rem" }}>
                {open ? <>
                    <li>GIFs are now supported when uploading images, emotes, or stickers.</li>
                    <li>Façades and a wishlist feature has been added to profile {wrapLink("Companies", "/company")}.</li>
                    <li>Added the {wrapLink("Clash Arena", "/clash-arena")} minigame.</li>
                    <li>Added the {wrapLink("Creator Directory", "/creators")} page.</li>
                    <li>Added support for alternative options in Builds and MD Plans.</li>
                </> : null}
            </ul>
        </div>

        {!open &&
            <span className="text-link" style={{ alignSelf: "center" }}>
                {open ? "▴ Click to Collapse ▴" : "▾ Click to Expand ▾"}
            </span>
        }
    </div>
}