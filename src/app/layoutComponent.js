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
import { FaBan } from "react-icons/fa";

import NitroAd from "./components/ads/NitroAd";
import ChatWrapper from "./components/chat/ChatWrapper";
import { DataProvider } from "./components/DataProvider";
import { ModalProvider } from "./components/modals/ModalProvider";
import { NavigationLoadingProvider } from "./components/NavigationLoadingProvider";
import NoPrefetchLink from "./components/NoPrefetchLink";
import RealtimeProvider from "./components/realtime/RealtimeProvider";
import { SiteCustomizationProvider } from "./components/SiteCustomizationProvider";
import AllTooltips from "./components/tooltips/AllTooltip";
import { getGeneralTooltipProps } from "./components/tooltips/GeneralTooltip";
import UserStatus from "./components/user/UserStatus";
import { AuthProvider } from "./database/authProvider";
import { RequestsCacheProvider } from "./database/RequestsCacheProvider";
import FooterNavigation from "./FooterNavigation";
import useLocalState from "./lib/useLocalState";
import TitleSearch from "./TitleSearch";

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
            { path: "/shadow-guesser", title: "Shadow Guesser" },
            { path: "/clash-arena", title: "Clash Arena" },
            { path: "/community-trivia", title: "Community Trivia Quiz" },
            { path: "/idle-sim", title: "LC Idle Mangement Sim"}
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

const ANNOUNCEMENT_NUMBER = 8;

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
                        Hi! I&apos;ve just launched a new minigame on the site: <NoPrefetchLink className="text-link" href={"/idle-sim"}>LC Idle Management Sim</NoPrefetchLink>. It&apos;s basically a mix of Lob Corp facility management and Limbus team building, but built as an idle game that you just check in on from time to time. Just an idea I thought would be fun to make. I&apos;ll continue adding content to it if people like it.
                        <br /><br />
                        As usual, feel free to submit suggestions through the Discord or the <NoPrefetchLink className="text-link" href={"/feedback"}>Feedback</NoPrefetchLink> page if you decide to check it out. Thanks!
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

// function NoAiIcon() {
//     return <div
//         style={{ display: "flex", position: "relative", "alignItems": "center", justifyContent: "center", paddingLeft: "1rem" }}
//         {...getGeneralTooltipProps("This website is human-authored. No AI-generated code is used on this site.")}
//     >
//         <span style={{ position: "absolute", fontSize: "18px", fontWeight: "bold" }}>AI</span>
//         <FaBan style={{ position: "absolute", width: "36px", height: "36px", color: "#bb0000", rotate: "90deg" }} />
//     </div>
// }

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
                                    headerCenterOverride={<TitleSearch />}
                                    // additionalSidebarIcons={<NoAiIcon />}
                                    sidebarTopComponent={<UserStatus />}
                                    footerTopComponent={<FooterNavigation />}
                                    sidebarBottomComponent={<div style={{ display: "flex", flexDirection: "column", textAlign: "center", marginTop: "0.5rem" }}>
                                        <span className="sub-text">This website is human-authored. No AI-generated code is used on this site.</span>
                                        <NitroAd id={"sidebar-ad"} height={600} style={{ margin: ".5rem" }} />
                                    </div>}
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
