import { useState } from "react";

import HoverBlocker from "./components/HoverBlocker";
import NoPrefetchLink from "./components/NoPrefetchLink";
import styles from "./homepage.module.css";

function NewContentWithClears({ wrapLink }) {
    const name = "Mnestic Experience Reflectrial";
    const category = "reflectrial";
    const encounter = "9-5-2";

    const clearsPath = `/encounters?category=${category}&encounter=${encounter}&tab=clears`;
    const buildPath = `/builds/new?tag=${category}-${encounter}`;

    return <div>
        The {name} is out! You can submit your clears or check out other clears on its {wrapLink("Encounters Page", clearsPath)}. You can also submit builds for it using its corresponding tag or by clicking {wrapLink("here", buildPath)}.
    </div>
}

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

        <NewContentWithClears wrapLink={wrapLink} />

        <div>
            <ul style={{ lineHeight: "1.3", marginTop: "0.5rem" }}>
                {open ? <>
                    <li>The {wrapLink("Encounters", "/encounters")} page now supports submitting clear records which will show up on a leaderboard sorted by turn count. This is only supported for Reflectrials and Refraction Railway encounters.</li>
                    <li>The bumps system for Reviews have been reworked into a more standard Upvotes and Funny Votes system similar to Steam Reviews. Existing reviews with bump scores have been given a boost equivalent to their bumps.</li>
                    <li>The individual Identity and E.G.O pages have been redesigned. Check them out if you&apos;re interested! This also affects everywhere skills are displayed.</li>
                    <li>Community Rankings have been recomputed to ignore ratings that are all 0s. If you want to submit a joke review without affecting ratings, you can now submit one with all 0s.</li>
                    <li>An {wrapLink("Archive", "/archive")} page has been added for pages on older stuff. The results to the previous survey have been posted there.</li>
                    <li>The {wrapLink("Extraction Simulator", "/extraction-simulator")} page has been added. Allowing users to simulate pulls for current, future, or custom banners. It also contains a probability calculator to compute the probability of getting banner items depending on how many pulls you use.</li>
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