"use client";

import "./styles/page-button.css";
import "./styles/text-link.css";
import "./styles/toggle-button.css";

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
    { path: "/my-profile", title: "My Profile" },
    { path: "/identities", title: "Identities" },
    { path: "/egos", title: "E.G.Os" },
    {
        title: "Mirror Dungeons", subpaths: [
            { path: "/achievements", title: "Achievements" },
            { path: "/gifts", title: "Gifts" },
            { path: "/fusions", title: "Fusion Recipes" },
            { path: "/themepacks", title: "Theme Packs" },
            { path: "/universal", title: "Universal Gifts/Gift Combos" },
        ]
    },
]

const description = <span>
    Limbus Company Tools is a free fan-made website with a variety of tools for players to use.
    Create and share team builds or Mirror Dungeon plans. Look up useful information on identities, E.G.Os, or Mirror Dungeons.
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
                linkSet={"limbus"}
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
