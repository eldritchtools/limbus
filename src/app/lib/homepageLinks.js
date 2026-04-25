import { useBreakpoint } from "@eldritchtools/shared-components";

import StatusIcon from "../components/icons/StatusIcon";
import NoPrefetchLink from "../components/NoPrefetchLink";

export const homepageLinks = [
    {
        category: "General",
        links: [
            { href: "/builds", title: "Team Builds", newHref: "/builds/new", icon: "WideAreaRampage" },
            { href: "/md-plans", title: "MD Plans", newHref: "/md-plans/new", icon: "IndexPrescriptDon_0" },
            { href: "/collections", title: "Collections", newHref: "/collections/new", icon: "WrappedCurseTag" },
            { href: "/identities", title: "Identities", icon: "EgoErodeReplica" },
            { href: "/egos", title: "E.G.Os", icon: "ActivatedEgoPassive" },
            { href: "/timers", title: "Timers", icon: "TimeAcceleration" },
            { href: "/encounters", title: "Encounters", icon: "HugeIrritationAlly" }
        ]
    },
    {
        category: "Mirror Dungeon",
        links: [
            { href: "/achievements", title: "Achievements Tracker", icon: "DistortedDongrangMomentaryGlory" },
            { href: "/gifts", title: "E.G.O Gifts", icon: "PowerOfLoveAndJustice" },
            { href: "/fusions", title: "Fusion Recipes", icon: "VibrationNesting" },
            { href: "/theme-packs", title: "Theme Packs", icon: "VengeanceBookSpider" },
            { href: "/md-events", title: "Choice Events", icon: "Aggro" }
        ]
    },
    {
        category: "Utility Tools",
        links: [
            { href: "/daily-random", title: "Daily Randomized Team", icon: "Cycle" },
            { href: "/training-calc", title: "Dispense and Training Calculator", icon: "ResultEnhancement" },
            { href: "/keyword-solver", title: "Keyword Solver", icon: "ThreeMirrorpartYiSang" },
            { href: "/team-randomizer", title: "Team Randomizer", icon: "MRR5BaseN" },
            { href: "/floor-planner", title: "Floor Planner", icon: "IndexPrescriptFaust_0" }
        ]
    },
    {
        category: "Others",
        links: [
            { href: "/about", title: "About", icon: "KnowledgeExplored" },
            { href: "/supporters", title: "Supporters", icon: "MagicalGirlAppear" },
            { href: "/feedback", title: "Feedback / Contact", icon: "TestWaitDocentRodion" }
        ]
    }
]

export const homepageLinksMapping = {};
homepageLinks.forEach(({ links }) => {
    links.forEach(link => homepageLinksMapping[link.href] = link);
})

function LinkComponent({ href, title, icon, clickable }) {
    const { isMobile } = useBreakpoint();
    const iconStyle = isMobile ? { width: "24px", height: "24px" } : { width: "32px", height: "32px" };

    if (clickable)
        return <NoPrefetchLink className="text-link" href={href} style={{ textDecoration: "none", display: "flex", alignItems: "center", maxWidth: "100%" }}>
            {icon ? <StatusIcon id={icon} style={iconStyle} /> : null}
            <span style={{ width: "100%", textWrap: "wrap" }}>{title}</span>
        </NoPrefetchLink>
    else
        return <div className="text-link" style={{ display: "flex", alignItems: "center", maxWidth: "100%" }}>
            {icon ? <StatusIcon id={icon} style={iconStyle} /> : null}
            <span style={{ width: "100%", textWrap: "wrap" }}>{title}</span>
        </div>
}

export function HomepageLink({ href, link, includeNew = false, clickable = false }) {
    const linkObj = link ?? homepageLinksMapping[href];

    return <div key={linkObj.href} style={{ display: "flex", alignItems: "center" }}>
        <LinkComponent {...linkObj} clickable={clickable} />
        {includeNew && linkObj.newHref ? <><span>&nbsp;(</span><LinkComponent href={linkObj.newHref} title={"New"} /><span>)</span></> : null}
    </div>
}

export function HomepageLinkList({ links, includeNew = false, clickable = false, style={} }) {
    return <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "0.5rem", ...style }}>
        {links
            .map(link => typeof link === "string" ? homepageLinksMapping[link] : link)
            .map(link => <HomepageLink key={link.href} link={link} includeNew={includeNew} clickable={clickable} />)
            .reduce((acc, curr, i) => i === 0 ? [curr] : [...acc, <span key={i}>•</span>, curr], [])
        }
    </div>
}