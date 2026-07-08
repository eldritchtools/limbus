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
                    <li>{wrapLink("Artwork Guesser", "/artwork-guesser")} and {wrapLink("Voiceline Guesser", "/voiceline-guesser")} have been added. They&apos;re still a bit experimental at the moment, but try them out for fun!</li>
                    <li>{wrapLink("Team Draft", "/team-draft")} has been added. Build a team by drafting from randomly generated options. Try it out if you&apos;re looking for a fresh way to play the game.</li>
                    <li>E.G.O Gifts can now be filtered by Triggers and Effects newly assigned to them. Triggers are conditions that enable or modify their effects, while Effects are the outcomes when those Triggers are fulfilled. These are manually assigned to gifts so there may be some mistakes or missing assignments. Some of them may be changed or improved on in the future.</li>
                    <li>The {wrapLink("Encounters", "/encounters")} page now supports submitting clear records which will show up on a leaderboard sorted by turn count. This is only supported for Reflectrials and Refraction Railway encounters.</li>
                    <li>The bumps system for Reviews have been reworked into a more standard Upvotes and Funny Votes system similar to Steam Reviews. Existing reviews with bump scores have been given a boost equivalent to their bumps.</li>
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