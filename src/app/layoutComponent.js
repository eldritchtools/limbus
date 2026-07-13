"use client";

import "./styles/page-button.css";
import "./styles/panel-container.css";
import "./styles/tabs.css";
import "./styles/text-link.css";
import "./styles/texts.css";
import "./styles/toggle-button.css";
import "./styles/toggle-text.css";

import { Layout } from "@eldritchtools/shared-components";
import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en"
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { DataProvider } from "./components/DataProvider";
import { ModalProvider } from "./components/modals/ModalProvider";
import NoPrefetchLink from "./components/NoPrefetchLink";
import { SiteCustomizationProvider } from "./components/SiteCustomizationProvider";
import AllTooltips from "./components/tooltips/AllTooltip";
import UserStatus from "./components/user/UserStatus";
import { AuthProvider } from "./database/authProvider";
import { RequestsCacheProvider } from "./database/RequestsCacheProvider";

TimeAgo.addDefaultLocale(en);

const paths = [
    { path: "/", title: "Home" },
    {
        title: "Community", subpaths: [
            { path: "/builds", title: "Team Builds" },
            { path: "/builds/new", title: "New Team Build" },
            { path: "/md-plans", title: "MD Plans" },
            { path: "/md-plans/new", title: "New MD Plan" },
            { path: "/collections", title: "Collections" },
            { path: "/collections/new", title: "New Collection" },
            { path: "/rankings", title: "Community Rankings" },
            { path: "/community-assets", title: "Community Assets" }
        ]
    },
    {
        title: "Database", subpaths: [
            { path: "/identities", title: "Identities" },
            { path: "/egos", title: "E.G.Os" },
            { path: "/encounters", title: "Encounters" },
            { path: "/timers", title: "Timers and Roadmap" },
            { path: "/release-history", title: "Release History" }
        ]
    },
    {
        title: "My Profile", subpaths: [
            { path: "/my-profile", title: "View My Profile" },
            { path: "/my-posts", title: "My Posts" },
            { path: "/edit-profile", title: "Edit Profile" },
            { path: "/company", title: "Company" },
            { path: "/site-customization", title: "Site Customization" }
        ]
    },
    {
        title: "Mirror Dungeons", subpaths: [
            { path: "/achievements", title: "Achievements Tracker" },
            { path: "/gifts", title: "Gifts" },
            { path: "/fusions", title: "Fusion Recipes" },
            { path: "/theme-packs", title: "Theme Packs" },
            { path: "/md-events", title: "Choice Events" },
            { path: "/universal", title: "Universal Gifts/Gift Combos" },
        ]
    },
    {
        title: "Tools", subpaths: [
            { path: "/daily-random", title: "Daily Randomized Team" },
            { path: "/training-calc", title: "Dispense and Training Calculator" },
            { path: "/team-solver", title: "Team Solver" },
            { path: "/team-randomizer", title: "Team Randomizer" },
            { path: "/floor-planner", title: "Floor Planner" },
            { path: "/extraction-simulator", title: "Extraction Simulator" },
            { path: "/team-draft", title: "Team Draft" }
        ]
    },
    {
        title: "Other / Site / Contact", subpaths: [
            { path: "/artwork-guesser", title: "Artwork Guesser" },
            { path: "/voiceline-guesser", title: "Voiceline Guesser" },
            { path: "/about", title: "About" },
            { path: "/feedback", title: "Feedback / Contact" },
            { path: "/guide", title: "Manager's Guide" },
            { path: "/archive", title: "Archive" },
            { path: "/update-history", title: "Update History" },
            { path: "/privacy", title: "Privacy Policy" },
            { path: "/terms", title: "Terms of Service" }
        ]
    },
    { path: "/support", title: "Support the Site" }
]

const description = <span>
    Limbus Company Tools is a community-driven website for users to share and discover team builds and Mirror Dungeon plans, view an Identities and E.G.Os database complete with community ratings and reviews, use Mirror Dungeon reference pages with an Achievemenet Tracker, or use tools such as calculators, solvers, randomizers, and planners.
</span>;

function Announcement() {
    const [hidden, setHidden] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (pathname === "/popularity-poll") setHidden(true);
    }, [pathname]);

    if (hidden) return null;

    return <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ backgroundColor: "var(--bg-hover)", borderRadius: "1rem", border: "1px solid var(--secondary-border-color)", maxWidth: "1200px", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
            <div style={{ padding: "8px 16px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "var(--primary-text-color)" }}>
                    <span style={{ lineHeight: "1.3" }}>
                        Hi! An end-of-season popularity poll is currently ongoing on the site. If you&apos;d like to leave a response or see the current results you can find it <NoPrefetchLink className="text-link" href="/popularity-poll">here</NoPrefetchLink>.
                        <br /> <br />
                        Content from the 9th Walpurgis Night have been added to the poll. You can update your repsonses if you want to change your votes.
                    </span>
                </div>

                <button
                    style={{ background: "none", border: "none", color: "var(--secondary-text-color)", cursor: "pointer", fontSize: "1.2rem", fontWeight: "bold" }}
                    onClick={() => setHidden(true)}
                >
                    ✕
                </button>
            </div>
        </div>
    </div>;
}

export default function LayoutComponent({ lastUpdated, children }) {
    return <AuthProvider>
        <RequestsCacheProvider>
            <SiteCustomizationProvider>
                <DataProvider>
                    <ModalProvider>
                        <Layout
                            title={"Limbus Company Tools"}
                            lastUpdated={lastUpdated}
                            // linkSet={"limbus"}
                            description={description}
                            gameName={"Limbus Company"}
                            developerName={"Project Moon"}
                            githubLink={"https://github.com/eldritchtools/limbus"}
                            paths={paths}
                            LinkComponent={NoPrefetchLink}
                            topComponent={<UserStatus />}
                        >
                            <Announcement />
                            {children}
                            <AllTooltips />
                        </Layout>
                    </ModalProvider>
                </DataProvider>
            </SiteCustomizationProvider>
        </RequestsCacheProvider>
    </AuthProvider>
}
