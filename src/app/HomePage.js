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
import DragContainer from "./components/objects/DragContainer";
import { useSiteCustomization } from "./components/SiteCustomizationProvider";
import { getHomepagePosts } from "./database/homepage";
import styles from "./homepage.module.css";
import { HomepageLinkList, homepageLinks } from "./lib/homepageLinks";
import { HomepageTimers } from "./timers/TimersTable";

function RecentAdditions() {
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

        {open ? <div>
            <ul style={{ lineHeight: "1.3" }}>
                <li>Profile pictures have been added to the site! Upload yours in the {wrapLink("Edit Profile", "/edit-profile")} page. The exact positioning and styling of profile pictures are subject to change since I&apos;m still experimenting on where best to put them. The will be no change to the affected parts of the site if no profile picture is provided.</li>
                <li>The seasonal roadmap has been added to the renamed {wrapLink("Timers and Roadmap", "/timers")} page.</li>
                <li>A {wrapLink("Reviewers", "/rankings?tab=reviewer")} tab has been added to the Community Rankings page allowing people to view the rankings and reviews of specific users. Viewing your own ratings lets you see everything you have and haven&apos;t rated.</li>
                <li>A large amount of alternative names have been added to most identities and E.G.Os. They should come up in search bars when searching for those names. The initial set is primarily NPCs that ids are based on, Abno names, and some commonly used abbreviations. Shorter versions of names that are just mashups of the original name plus the sinner name may be excluded since you can already search for them with the original name. Feel free to suggest more if you try something that doesn&apos;t show up.</li>
            </ul>
        </div> : null}

        {!open &&
            <span className="text-link" style={{ alignSelf: "center" }}>
                {open ? "▴ Click to Collapse ▴" : "▾ Click to Expand ▾"}
            </span>
        }
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

export default function HomePage() {
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
            <h1 style={{ marginTop: "0.25rem", marginBottom: "0.25rem" }}>Limbus Company Tools</h1>
            <p>
                Welcome, Manager!
                <br /> <br />
                Limbus Company Tools is a hub for sharing team builds and Mirror Dungeon plans. View an Identities and E.G.Os database complete with community ratings and reviews. Use calculators, planners, team randomizers, and other reference tools for the game.
                <br /> <br />
                Use the links below to get started or check out the <NoPrefetchLink className="text-link" href={"/edit-profile"}>Edit Profile</NoPrefetchLink> or <NoPrefetchLink className="text-link" href={"/site-customization"}>Site Customization</NoPrefetchLink> pages to customize your profile or site experience.
            </p>
            <LinksMenu />
            <HomepageTimers />
            <RecentAdditions />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", width: "100%" }}>
                <div className={styles.panelContainer} style={{ alignItems: "start", gap: "0.5rem" }}>
                    <h3 style={{ margin: 0 }}>Latest Identities and E.G.Os</h3>
                    {identitiesLoading || egosLoading ? "Loading..." :
                        <DragContainer>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                {latest.map(([date, list]) =>
                                    <div key={date} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "start" }}>
                                        <div>{date}</div>
                                        <div style={{ display: "flex" }}>
                                            {list.map(obj => obj.id[0] === "1" ?
                                                (obj.upcoming ?
                                                    <div key={obj.id} style={{ width: "128px", height: "128px" }}>
                                                        <IdentityIcon identity={obj} uptie={4} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none" }} />
                                                    </div> :
                                                    <NoPrefetchLink key={obj.id} href={`/identities/${obj.id}`}>
                                                        <div style={{ width: "128px", height: "128px" }}>
                                                            <IdentityIcon identity={obj} uptie={4} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none" }} />
                                                        </div>
                                                    </NoPrefetchLink>
                                                ) :
                                                (obj.upcoming ?
                                                    <div key={obj.id} style={{ width: "128px", height: "128px" }}>
                                                        <EgoIcon ego={obj} type={"awaken"} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none" }} />
                                                    </div> :
                                                    <NoPrefetchLink key={obj.id} href={`/egos/${obj.id}`}>
                                                        <div style={{ width: "128px", height: "128px" }}>
                                                            <EgoIcon ego={obj} type={"awaken"} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none" }} />
                                                        </div>
                                                    </NoPrefetchLink>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DragContainer>
                    }
                </div>
                <div className={styles.panelContainer} style={{ "gap": "0.2rem" }}>
                    {/* <div style={{ fontSize: "0.9rem", color: "#aaa", textAlign: "start" }}>Announcement</div> */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "start" }}>
                        <h3 style={{ margin: 0 }}>Update History</h3>
                        <NoPrefetchLink className="text-link" href={"/update-history"}>view full update history</NoPrefetchLink>
                    </div>
                    {updatesLoading ?
                        "Loading..." :
                        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", width: "100%", gap: ".2rem" }}>
                            {updates.slice(0, 8).map((update, i) => <React.Fragment key={i}>
                                <span className="sub-text">{update.date}</span>
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
                <div className={styles.panelContainer} style={{ "gap": "0.5rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Popular Builds</h3>
                            <NoPrefetchLink className="text-link" href={"/builds?mode=popular"}>view more popular builds ➔</NoPrefetchLink>
                        </div>
                        <div className="sub-text" style={{ alignSelf: "start", textAlign: "start" }}>
                            The most popular builds. Updated once every four hours.
                        </div>
                        {popular.length > 0 ?
                            <DragContainer style={{ paddingLeft: "1rem" }}>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    {popular.map(build => <TeamBuild key={build.id} build={build} size={"S"} complete={false} />)}
                                </div>
                            </DragContainer> : "Loading..."
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Newest Builds</h3>
                            <NoPrefetchLink className="text-link" href={"/builds?mode=recent"}>view more new builds ➔</NoPrefetchLink>
                        </div>
                        <div className="sub-text" style={{ alignSelf: "start", textAlign: "start" }}>
                            The newest builds submitted by managers.
                        </div>
                        {newest.length > 0 ?
                            <DragContainer style={{ paddingLeft: "1rem" }}>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    {newest.map(build => <TeamBuild key={build.id} build={build} size={"S"} complete={false} />)}
                                </div>
                            </DragContainer> : "Loading..."
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Community Showcase</h3>
                            <NoPrefetchLink className="text-link" href={"/builds?mode=random"}>view random builds ➔</NoPrefetchLink>
                        </div>
                        <div className="sub-text" style={{ alignSelf: "start", textAlign: "start" }}>
                            A random build with at least 1 like is added to this list every hour and the oldest is rotated out.
                        </div>
                        {showcase.length > 0 ?
                            <DragContainer style={{ paddingLeft: "1rem" }}>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    {showcase.map(build => <TeamBuild key={build.id} build={build} size={"S"} complete={false} />)}
                                </div>
                            </DragContainer> : "Loading..."
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Newest MD Plans</h3>
                            <NoPrefetchLink className="text-link" href={"/md-plans?mode=new"}>view more new md plans ➔</NoPrefetchLink>
                        </div>
                        <div className="sub-text" style={{ alignSelf: "start", textAlign: "start" }}>
                            The newest md plans submitted by managers.
                        </div>
                        {mdplans.length > 0 ?
                            <DragContainer>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    {mdplans.map(plan => <MdPlan key={plan.id} plan={plan} complete={false} />)}
                                </div>
                            </DragContainer> : "Loading..."
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>
}
