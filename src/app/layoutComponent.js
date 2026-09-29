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

import NitroAd from "./components/ads/NitroAd";
import ChatWrapper from "./components/chat/ChatWrapper";
import { DataProvider } from "./components/DataProvider";
import { ModalProvider } from "./components/modals/ModalProvider";
import { NavigationLoadingProvider } from "./components/NavigationLoadingProvider";
import NoPrefetchLink from "./components/NoPrefetchLink";
import RealtimeProvider from "./components/realtime/RealtimeProvider";
import { SiteCustomizationProvider } from "./components/SiteCustomizationProvider";
import AllTooltips from "./components/tooltips/AllTooltip";
import UserStatus from "./components/user/UserStatus";
import { AuthProvider } from "./database/authProvider";
import { RequestsCacheProvider } from "./database/RequestsCacheProvider";
import FooterNavigation from "./FooterNavigation";
import useLocalState from "./lib/useLocalState";

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
            { path: "/community-assets", title: "Community Assets" },
            { path: "/creators", title: "Creator Directory" }
        ]
    },
    {
        title: "Database", subpaths: [
            { path: "/identities", title: "Identities" },
            { path: "/egos", title: "E.G.Os" },
            { path: "/encounters", title: "Encounters" },
            { path: "/timers", title: "Timers and Roadmap" },
            { path: "/gms-explorer", title: "GMS Explorer" },
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
        title: "Minigames", subpaths: [
            { path: "/artwork-guesser", title: "Artwork Guesser" },
            { path: "/voiceline-guesser", title: "Voiceline Guesser" },
            { path: "/clash-arena", title: "Clash Arena" },
        ]
    },
    {
        title: "Other / Site / Contact", subpaths: [
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

// function AnnouncementNavigationWatcher({ setHidden }) {
//     const pathname = usePathname();

//     useEffect(() => {
//         if (pathname === "/popularity-poll") setHidden(true);
//     }, [pathname, setHidden]);

//     return null;
// }

const ANNOUNCEMENT_NUMBER = 7;

function Announcement() {
    const [hidden, setHidden, init] = useLocalState("latestHiddenAnnouncement", 0);

    if (!init || hidden >= ANNOUNCEMENT_NUMBER) return null;

    return <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1rem" }}>
        {/* <Suspense fallback={null}>
            <AnnouncementNavigationWatcher setHidden={setHidden} />
        </Suspense> */}
        <div style={{ backgroundColor: "var(--bg-hover)", borderRadius: "1rem", border: "1px solid var(--secondary-border-color)", maxWidth: "1200px", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
            <div style={{ padding: "8px 16px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "var(--primary-text-color)" }}>
                    <span style={{ lineHeight: "1.3" }}>
                        Hi! I&apos;ve introduced ads to the site to help cover hosting costs and allow me to continue spending time maintaining and improving the site. I&apos;m still figuring out where to place them and how many to have, so this first update only has a few placements. More pages will likely get ads in the future and ad positions may move around while I figure out what works. Ideally, I want the ads to be enough for me to be able to keep the site running long term, while making sure they aren&apos;t obstructive to everyone&apos;s experience.
                        <br /><br />
                        Feel free to submit suggestions through the <NoPrefetchLink className="text-link" href={"/feedback"}>Feedback</NoPrefetchLink> page if you have ideas or feel certain placements are problematic. There are also settings in the <NoPrefetchLink className="text-link" href={"/site-customization"}>Site Customization</NoPrefetchLink> page to customize or remove the ads. You&apos;re free to turn them off, but keeping them on is a free and easy way to support the site. Thanks!
                    </span>
                </div>

                <button
                    style={{ background: "none", border: "none", color: "var(--secondary-text-color)", cursor: "pointer", fontSize: "1.2rem", fontWeight: "bold" }}
                    onClick={() => setHidden(ANNOUNCEMENT_NUMBER)}
                >
                    ✕
                </button>
            </div>
        </div>
    </div>;
}

export default function LayoutComponent({ lastUpdated, children }) {
    return <NavigationLoadingProvider>
        <AuthProvider>
            <RequestsCacheProvider>
                <SiteCustomizationProvider>
                    <DataProvider>
                        <ModalProvider>
                            <RealtimeProvider>
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
                                    sidebarTopComponent={<UserStatus />}
                                    footerTopComponent={<FooterNavigation />}
                                    sidebarBottomComponent={<NitroAd id={"sidebar-ad"} style={{ margin: ".5rem" }} />}
                                    footerLeftComponent={<NitroAd id={"footer-left-ad"} height={220} style={{ marginRight: "2rem", boxSizing: "border-box" }} mediaTypes={["desktop"]} adLevel={"high"} />}
                                    footerRightComponent={<NitroAd id={"footer-right-ad"} height={220} style={{ marginLeft: "2rem", boxSizing: "border-box" }} mediaTypes={["desktop"]} adLevel={"high"} />}
                                    footerBottomComponent={<NitroAd id={"footer-bottom-ad"} height={90} style={{ marginLeft: "2rem", boxSizing: "border-box" }} />}
                                >
                                    <Announcement />
                                    {children}
                                    <AllTooltips />
                                </Layout>
                                <ChatWrapper />
                            </RealtimeProvider>
                        </ModalProvider>
                    </DataProvider>
                </SiteCustomizationProvider>
            </RequestsCacheProvider>
        </AuthProvider>
    </NavigationLoadingProvider>
}
