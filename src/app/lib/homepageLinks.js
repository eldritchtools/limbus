import { useBreakpoint } from "@eldritchtools/shared-components";

import StatusIcon from "../components/icons/StatusIcon";
import NoPrefetchLink from "../components/NoPrefetchLink";

export const homepageLinks = [
    {
        category: "Community",
        links: [
            { href: "/builds", title: "Team Builds", newHref: "/builds/new", icon: "WideAreaRampage" },
            { href: "/md-plans", title: "MD Plans", newHref: "/md-plans/new", icon: "IndexPrescriptDon_0" },
            { href: "/collections", title: "Collections", newHref: "/collections/new", icon: "WrappedCurseTag" },
            { href: "/rankings", title: "Community Rankings", icon: "EgoAwakenDongrangRadiantDesire" },
            { href: "/community-assets", title: "Community Assets", icon: "GotACompliment"}
        ]
    },
    {
        category: "Database",
        links: [
            { href: "/identities", title: "Identities", icon: "EgoErodeReplica" },
            { href: "/egos", title: "E.G.Os", icon: "ActivatedEgoPassive" },
            { href: "/encounters", title: "Encounters", icon: "HugeIrritationAlly" },
            { href: "/timers", title: "Timers and Roadmap", icon: "TickTockTickTock" }
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
        category: "Tools",
        links: [
            { href: "/daily-random", title: "Daily Randomized Team", icon: "Cycle" },
            { href: "/training-calc", title: "Dispense and Training Calculator", icon: "ResultEnhancement" },
            { href: "/team-solver", title: "Team Solver", icon: "ThreeMirrorpartYiSang" },
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
            <span style={{ flex: 1, textWrap: "wrap", textAlign: "start" }}>{title}</span>
        </NoPrefetchLink>
    else
        return <div className="text-link" style={{ display: "flex", alignItems: "center", maxWidth: "100%" }}>
            {icon ? <StatusIcon id={icon} style={iconStyle} /> : null}
            <span style={{ maxWidth: "calc(100%-32px)", textWrap: "wrap", textAlign: "start" }}>{title}</span>
        </div>
}

export function HomepageLink({ href, link, includeNew = false, clickable = false }) {
    const linkObj = link ?? homepageLinksMapping[href];

    return <div key={linkObj.href} style={{ display: "flex", alignItems: "center" }}>
        <LinkComponent {...linkObj} clickable={clickable} />
        {includeNew && linkObj.newHref ? <><span>&nbsp;(</span><LinkComponent href={linkObj.newHref} title={"New"} clickable={clickable} /><span>)</span></> : null}
    </div>
}

export function HomepageLinkList({ links, includeNew = false, clickable = false, style={} }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.2rem", maxWidth: "100%", ...style }}>
        {links
            .map(link => typeof link === "string" ? homepageLinksMapping[link] : link)
            .map(link => <HomepageLink key={link.href} link={link} includeNew={includeNew} clickable={clickable} />)
        }
    </div>
}