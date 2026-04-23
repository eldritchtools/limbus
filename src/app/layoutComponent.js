"use client";

import "./styles/page-button.css";
import "./styles/tabs.css";
import "./styles/text-link.css";
import "./styles/toggle-button.css";
import "./styles/toggle-text.css";

import { Layout } from "@eldritchtools/shared-components";
import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en"
import { useEffect, useState } from "react";

import { DataProvider, getMeta } from "./components/DataProvider";
import { ModalProvider } from "./components/modals/ModalProvider";
import NoPrefetchLink from "./components/NoPrefetchLink";
import AllTooltips from "./components/tooltips/AllTooltip";
import UserStatus from "./components/user/UserStatus";
import { AuthProvider } from "./database/authProvider";
import { RequestsCacheProvider } from "./database/RequestsCacheProvider";

TimeAgo.addDefaultLocale(en);

const paths = [
    { path: "/", title: "Home" },
    { path: "/builds", title: "Team Builds" },
    { path: "/md-plans", title: "MD Plans" },
    { path: "/collections", title: "Collections" },
    { path: "/identities", title: "Identities" },
    { path: "/egos", title: "E.G.Os" },
    { path: "/timers", title: "Timers" },
    { path: "/encounters", title: "Encounters"},
    {
        title: "My Profile", subpaths: [
            { path: "/my-posts", title: "My Posts" },
            { path: "/edit-profile", title: "Edit Profile" },
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
        title: "Utility Tools", subpaths: [
            { path: "/daily-random", title: "Daily Randomized Team" },
            { path: "/training-calc", title: "Dispense and Training Calculator" },
            { path: "/keyword-solver", title: "Keyword Solver" },
            { path: "/team-randomizer", title: "Team Randomizer" },
            { path: "/floor-planner", title: "Floor Planner" }
        ]
    },
    {
        title: "Site / Contact", subpaths: [
            { path: "/about", title: "About"},
            { path: "/supporters", title: "Supporters"},
            { path: "/update-history", title: "Update History" },
            { path: "/feedback", title: "Feedback / Contact" },
            { path: "/privacy", title: "Privacy Policy"},
            { path: "/terms", title: "Terms of Service"}
        ]
    }
]

const description = <span>
    Limbus Company Tools is a community-driven website combining user-submitted content, tools, and reference resources for the game Limbus Company.
</span>;

export default function LayoutComponent({ children }) {
    const [lastUpdated, setLastUpdated] = useState(process.env.NEXT_PUBLIC_LAST_UPDATED);
    useEffect(() => {
        getMeta().then(meta => setLastUpdated(p => p > meta.datetime ? p : meta.datetime));
    }, []);

    return <AuthProvider>
        <RequestsCacheProvider>
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
                <DataProvider>
                    <ModalProvider>
                        {children}
                        <AllTooltips />
                    </ModalProvider>
                </DataProvider>
            </Layout>
        </RequestsCacheProvider>
    </AuthProvider>
}
