'use client';

import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useEffect, useMemo, useState } from "react";

import MdPlan from "./components/contentCards/MdPlan";
import TeamBuild from "./components/contentCards/TeamBuild";
import { useEgosWithUpcoming, useIdentitiesWithUpcoming } from "./components/dataHooks/upcoming";
import { useData } from "./components/DataProvider";
import HoverBlocker from "./components/HoverBlocker";
import EgoIcon from "./components/icons/EgoIcon";
import IdentityIcon from "./components/icons/IdentityIcon";
import { useModal } from "./components/modals/ModalProvider";
import NoPrefetchLink from "./components/NoPrefetchLink";
import { useSiteCustomization } from "./components/SiteCustomizationProvider";
import { getHomepagePosts } from "./database/homepage";
import styles from "./homepage.module.css";
import { HomepageLinkList, homepageLinks } from "./lib/homepageLinks";
import { HomepageTimers } from "./timers/TimersTable";

function RecentAdditions() {
    const [blockHover, setBlockHover] = useState(false);
    const [open, setOpen] = useState(false);

    return <div
        className={`${styles.recentAdditions} ${!blockHover ? styles.canHover : null}`}
        onClick={!blockHover ? () => setOpen(p => !p) : null}
    >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Recent Additions</span>
            <span style={{ fontSize: "0.9rem", color: "#aaa" }}>Most notable changes in case you missed them.</span>
        </div>

        {open ? <div>
            <ul style={{lineHeight: "1.3"}}>
                <li>All new extreme theme pack bosses and bosses for the new intervallo theme packs and story nodes have been added to the Encounters Page.</li>
                <li>Added an exclusive gifts helper section to the <HoverBlocker setBlockHover={setBlockHover}><NoPrefetchLink className="text-link" href={"/floor-planner"}>Floor Planner</NoPrefetchLink></HoverBlocker> tool to help users in selecting theme packs.</li>
                <li>Team <HoverBlocker setBlockHover={setBlockHover}><NoPrefetchLink className="text-link" href={"/team-solver"}>Solver</NoPrefetchLink></HoverBlocker> and <HoverBlocker setBlockHover={setBlockHover}><NoPrefetchLink className="text-link" href={"/team-randomizer"}>Randomizer</NoPrefetchLink></HoverBlocker> tools now support using the user&apos;s Company Data to set the Black/Whitelist. The toggle has also been changed to a show/hide toggle rather than an active/inactive toggle and the number of items on the list is now shown on the button.</li>
                <li>Updated the popularity scoring function since older posts&apos; scores weren&apos;t decaying properly with age.</li>
                <li>Keyword Solver has been renamed to <HoverBlocker setBlockHover={setBlockHover}><NoPrefetchLink className="text-link" href={"/team-solver"}>Team Solver</NoPrefetchLink></HoverBlocker> and now supports statuses and tags/factions. It also now returns results with less sinners than the specified team size if they already meet the criteria.</li>
                <li>MD Plans now has a tracking mode. Activate it to mark gifts as obtained or theme packs as entered to follow the plan easier.</li>
            </ul>
        </div> : null}

        <span className="text-link" style={{ alignSelf: "center" }}>
            {open ? "▴ Click to Collapse ▴" : "▾ Click to Expand ▾"}
        </span>
    </div>

}

function LinksMenu() {
    const { getCustomizationValue } = useSiteCustomization();
    const favorite = getCustomizationValue("favoriteLinks");
    const [forceOpen, setForceOpen] = useState(false);

    return <div className={styles.LinksMenu}>
        {favorite !== null && favorite.length > 0 ? <HomepageLinkList links={favorite} includeNew={true} clickable={true} /> : null}
        {forceOpen || favorite === null ?
            homepageLinks.map((section, i) => <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {section.category ? <span className={styles.LinksCategory}>{section.category}</span> : null}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <HomepageLinkList links={section.links} includeNew={true} clickable={true} />
                </div>
            </div>) :
            null
        }
        {
            !forceOpen && favorite !== null ?
                <span className="text-link" onClick={() => setForceOpen(true)}>▾ Expand Links ▾</span> :
                null
        }
    </div>
}

export default function Home() {
    const [identities, identitiesLoading] = useIdentitiesWithUpcoming();
    const [egos, egosLoading] = useEgosWithUpcoming();
    const [updates, updatesLoading] = useData("updates_index");
    const { openUpdateHistoryModal } = useModal();
    const [popular, setPopular] = useState([]);
    const [newest, setNewest] = useState([]);
    const [showcase, setShowcase] = useState([]);
    const [mdplans, setMdplans] = useState([]);
    const { isDesktop } = useBreakpoint();

    useEffect(() => {
        const getBuilds = async () => {
            const { popular, newest, showcase, mdplans } = await getHomepagePosts();
            setPopular(popular);
            setNewest(newest);
            setShowcase(showcase);
            setMdplans(mdplans);
        }

        getBuilds();
    }, []);

    const latest = useMemo(() => {
        if (identitiesLoading || egosLoading) return [];
        const dates = {};

        Object.values(identities).forEach(x => {
            if (!(x.date in dates)) dates[x.date] = [x];
            else dates[x.date].push(x);
        });
        Object.values(egos).forEach(x => {
            if (!(x.date in dates)) dates[x.date] = [x];
            else dates[x.date].push(x);
        });

        return Object.keys(dates).sort((a, b) => {
            if (a.includes("?")) return -1;
            if (b.includes("?")) return 1;
            return b.localeCompare(a);
        }).slice(0, 10).map(x => [x, dates[x]]);
    }, [identities, identitiesLoading, egos, egosLoading]);

    return <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem", width: "100%", height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.5rem", maxWidth: isDesktop ? "min(90%, 1200px)" : "100%" }}>
            <h2 style={{ margin: 0 }}>Welcome to Limbus Company Tools, Manager!</h2>
            <p>
                Limbus Company Tools is a platform for managers to create, share, and discover various builds and strategies for use in their gameplay. Users can also find various tools and database pages for the game.
            </p>
            <LinksMenu />
            <HomepageTimers />
            <RecentAdditions />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", width: "100%" }}>
                <div style={{ minWidth: "300px", flex: 1, display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem", border: "1px solid #aaa", borderRadius: "0.5rem", padding: "1rem", boxSizing: "border-box" }}>
                    <h3 style={{ margin: 0 }}>Latest Additions</h3>
                    {identitiesLoading || egosLoading ? "Loading..." :
                        <div style={{ maxWidth: "100%", overflowX: "auto", overflowY: "hidden", scrollbarWidth: "thin" }}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                {latest.map(([date, list]) =>
                                    <div key={date} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "start" }}>
                                        <div>{date}</div>
                                        <div style={{ display: "flex" }}>
                                            {list.map(obj => obj.id[0] === "1" ?
                                                (obj.upcoming ?
                                                    <div key={obj.id} style={{ width: "128px", height: "128px" }}>
                                                        <IdentityIcon identity={obj} uptie={4} displayName={true} displayRarity={true} includeTooltip={true} />
                                                    </div> :
                                                    <NoPrefetchLink key={obj.id} href={`/identities/${obj.id}`}>
                                                        <div style={{ width: "128px", height: "128px" }}>
                                                            <IdentityIcon identity={obj} uptie={4} displayName={true} displayRarity={true} includeTooltip={true} />
                                                        </div>
                                                    </NoPrefetchLink>
                                                ) :
                                                (obj.upcoming ?
                                                    <div key={obj.id} style={{ width: "128px", height: "128px" }}>
                                                        <EgoIcon ego={obj} type={"awaken"} displayName={true} displayRarity={true} includeTooltip={true} />
                                                    </div> :
                                                    <NoPrefetchLink key={obj.id} href={`/egos/${obj.id}`}>
                                                        <div style={{ width: "128px", height: "128px" }}>
                                                            <EgoIcon ego={obj} type={"awaken"} displayName={true} displayRarity={true} includeTooltip={true} />
                                                        </div>
                                                    </NoPrefetchLink>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                </div>
                <div style={{ minWidth: "300px", flex: 1, display: "flex", flexDirection: "column", "gap": "0.2rem", border: "1px solid #aaa", borderRadius: "0.5rem", padding: "1rem", boxSizing: "border-box" }}>
                    {/* <div style={{ fontSize: "0.9rem", color: "#aaa", textAlign: "start" }}>Announcement</div> */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "start" }}>
                        <h3 style={{ margin: 0 }}>Update History</h3>
                        <NoPrefetchLink className="text-link" href={"/update-history"}>view full update history</NoPrefetchLink>
                    </div>
                    {updatesLoading ?
                        "Loading..." :
                        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", width: "100%", gap: ".2rem" }}>
                            {updates.slice(0, 8).map((update, i) => <React.Fragment key={i}>
                                <span style={{ color: "#aaa", fontSize: "0.9rem" }}>{update.date}</span>
                                <span className="text-link"
                                    style={{ marginLeft: "0.3rem", textAlign: "start", fontWeight: "normal" }}
                                    onClick={() => openUpdateHistoryModal({ date: update.date, title: update.title, path: update.path })} >
                                    {update.title}
                                </span>
                            </React.Fragment>)}
                        </div>
                    }
                </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", width: "100%" }}>
                <div style={{ minWidth: "300px", flex: 1, display: "flex", flexDirection: "column", "gap": "0.5rem", border: "1px solid #aaa", borderRadius: "0.5rem", padding: "1rem", boxSizing: "border-box" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Popular Builds</h3>
                            <NoPrefetchLink className="text-link" href={"/builds?mode=popular"}>view more popular builds ➔</NoPrefetchLink>
                        </div>
                        <div style={{ color: "#aaa", fontSize: "0.8rem", alignSelf: "start", textAlign: "start" }}>
                            The most popular builds. Updated once every four hours.
                        </div>
                        {popular.length > 0 ?
                            <div style={{ paddingLeft: "1rem", overflowX: "auto", scrollbarWidth: "thin" }}>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    {popular.map(build => <TeamBuild key={build.id} build={build} size={"S"} complete={false} />)}
                                </div>
                            </div> : "Loading..."
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Newest Builds</h3>
                            <NoPrefetchLink className="text-link" href={"/builds?mode=recent"}>view more new builds ➔</NoPrefetchLink>
                        </div>
                        <div style={{ color: "#aaa", fontSize: "0.8rem", alignSelf: "start", textAlign: "start" }}>
                            The newest builds submitted by managers.
                        </div>
                        {newest.length > 0 ?
                            <div style={{ paddingLeft: "1rem", overflowX: "auto", scrollbarWidth: "thin" }}>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    {newest.map(build => <TeamBuild key={build.id} build={build} size={"S"} complete={false} />)}
                                </div>
                            </div> : "Loading..."
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Community Showcase</h3>
                            <NoPrefetchLink className="text-link" href={"/builds?mode=random"}>view random builds ➔</NoPrefetchLink>
                        </div>
                        <div style={{ color: "#aaa", fontSize: "0.8rem", alignSelf: "start", textAlign: "start" }}>
                            A random build with at least 1 like is added to this list every hour and the oldest is rotated out.
                        </div>
                        {showcase.length > 0 ?
                            <div style={{ paddingLeft: "1rem", overflowX: "auto", scrollbarWidth: "thin" }}>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    {showcase.map(build => <TeamBuild key={build.id} build={build} size={"S"} complete={false} />)}
                                </div>
                            </div> : "Loading..."
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Newest MD Plans</h3>
                            <NoPrefetchLink className="text-link" href={"/md-plans?mode=new"}>view more new md plans ➔</NoPrefetchLink>
                        </div>
                        <div style={{ color: "#aaa", fontSize: "0.8rem", alignSelf: "start", textAlign: "start" }}>
                            The newest md plans submitted by managers.
                        </div>
                        {mdplans.length > 0 ?
                            <div style={{ overflowX: "auto", scrollbarWidth: "thin" }}>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    {mdplans.map(plan => <MdPlan key={plan.id} plan={plan} complete={false} />)}
                                </div>
                            </div> : "Loading..."
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>
}

// Links Old
// 
// <div style={{ minWidth: "300px", flex: 1, display: "flex", flexDirection: "column", "gap": "0.5rem", border: "1px solid #aaa", borderRadius: "0.5rem", padding: "1rem", boxSizing: "border-box" }}>
//     <div style={{ fontSize: "0.9rem", color: "#aaa", textAlign: "start" }}>Manager Posts</div>
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", width: "100%", gap: ".5rem" }}>
//         <NoPrefetchLink className="text-link" href={"/builds"}>Team Builds</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/md-plans"}>MD Plans</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/collections"}>Collections</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/builds/new"}>New Build</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/md-plans/new"}>New Plan</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/collections/new"}>New Collection</NoPrefetchLink>
//     </div>
//     <div style={{ fontSize: "0.9rem", color: "#aaa", textAlign: "start" }}>Database</div>
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", width: "100%", gap: ".5rem" }}>
//         <NoPrefetchLink className="text-link" href={"/identities"}>Identities</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/egos"}>E.G.Os</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/timers"}>Timers</NoPrefetchLink>
//     </div>
//     <div style={{ fontSize: "0.9rem", color: "#aaa", textAlign: "start" }}>Mirror Dungeon</div>
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", width: "100%", gap: ".5rem" }}>
//         <NoPrefetchLink className="text-link" href={"/achievements"}>Achievements Tracker</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/gifts"}>E.G.O Gifts</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/fusions"}>Fusion Recipes</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/theme-packs"}>Theme Packs</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/md-events"}>Choice Events</NoPrefetchLink>
//     </div>
//     <div style={{ fontSize: "0.9rem", color: "#aaa", textAlign: "start" }}>Utility Tools</div>
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", width: "100%", gap: ".5rem" }}>
//         <NoPrefetchLink className="text-link" href={"/daily-random"}>Daily Randomized Team</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/training-calc"}>Dispense and Training Calculator</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/keyword-solver"}>Keyword Solver</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/team-randomizer"}>Team Randomizer</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/floor-planner"}>Floor Planner</NoPrefetchLink>
//     </div>
//     <div style={{ fontSize: "0.9rem", color: "#aaa", textAlign: "start" }}>Site</div>
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", width: "100%", gap: ".5rem" }}>
//         <NoPrefetchLink className="text-link" href={"/about"}>About</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/supporters"}>Supporters</NoPrefetchLink>
//         <NoPrefetchLink className="text-link" href={"/feedback"}>Feedback / Contact</NoPrefetchLink>
//     </div>
// </div>