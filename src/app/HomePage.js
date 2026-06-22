'use client';

import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useEffect, useMemo, useState } from "react";

import CommunityPoll from "./CommunityPoll";
import MdPlan from "./components/contentCards/MdPlan";
import TeamBuild from "./components/contentCards/TeamBuild";
import { useEgosWithUpcoming, useIdentitiesWithUpcoming } from "./components/dataHooks/upcoming";
import { useData } from "./components/DataProvider";
import HoverBlocker from "./components/HoverBlocker";
import EgoIcon from "./components/icons/EgoIcon";
import IdentityIcon from "./components/icons/IdentityIcon";
import ImageHandler from "./components/icons/ImageHandler";
import { useModal } from "./components/modals/ModalProvider";
import NoPrefetchLink from "./components/NoPrefetchLink";
import DragContainer from "./components/objects/DragContainer";
import { useSiteCustomization } from "./components/SiteCustomizationProvider";
import { getHomepagePosts } from "./database/homepage";
import styles from "./homepage.module.css";
import { HomepageLinkList, homepageLinks } from "./lib/homepageLinks";
import RandomTips from "./RandomTips";
import RecentAdditions from "./RecentAdditions";
import { HomepageTimers } from "./timers/TimersTable";

function LinksMenu({ isMobile }) {
    const { getCustomizationValue } = useSiteCustomization();
    const favorite = getCustomizationValue("favoriteLinks");
    const [forceOpen, setForceOpen] = useState(false);

    const chunked = [];
    if (favorite) for (let i = 0; i < favorite.length; i += 5) chunked.push(favorite.slice(i, i + 5));
    const sectionWidth = isMobile ? "160px" : "200px";

    return <div style={{
        display: "flex", flexDirection: "column", width: "100%",
        alignSelf: "start", alignItems: "center"
    }}>
        {favorite && favorite.length > 0 &&
            <DragContainer>
                <div className={styles.LinksMenu} style={{ justifyContent: isMobile ? "start" : "center", width: isMobile ? "max-content" : "100%" }}>
                    {chunked.map((items, index) =>
                        <div key={index} className="panel-container" style={{ width: sectionWidth }}>
                            <HomepageLinkList links={items} includeNew={true} clickable={true} style={{ width: sectionWidth }} />
                        </div>)
                    }
                </div>
            </DragContainer>
        }

        {forceOpen || !favorite ?
            <DragContainer>
                <div className={styles.LinksMenu} style={{ justifyContent: isMobile ? "start" : "center", width: isMobile ? "max-content" : "100%" }}>
                    {homepageLinks.map((section, i) => <div key={i} className="panel-container" style={{ display: "flex", flexDirection: "column", width: sectionWidth }}>
                        {section.category ? <span className={styles.LinksCategory}>{section.category}</span> : null}
                        <HomepageLinkList links={section.links} includeNew={true} clickable={true} style={{ width: sectionWidth }} />
                    </div>)}
                </div>
            </DragContainer> :
            null
        }

        {
            !forceOpen && favorite ?
                <span className="text-link" onClick={() => setForceOpen(true)}>▾ Expand Links ▾</span> :
                null
        }
    </div>
}

function APR() {
    return <NoPrefetchLink href="/apr-2026" className="text-link">
        <div className="panel-container" style={{ display: "flex", flexDirection: "row", alignItems: "center", maxWidth: "500px", gap: "0.5rem" }}>
            <ImageHandler path={"apr_2026/logo.webp"} style={{ width: "96px" }} />
            <span>
                Absolute Pride Resonance is an annual charity event organized by creators from the Project Moon community during the month of June. If you have the time, consider checking out the schedule of events by clicking here.
            </span>
        </div>
    </NoPrefetchLink>
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
    const [poll, setPoll] = useState(null);
    const { isMobile, isDesktop } = useBreakpoint();

    useEffect(() => {
        const getBuilds = async () => {
            const { popular, newest, showcase, mdplans, poll } = await getHomepagePosts();
            setPopular(popular);
            setNewest(newest);
            setShowcase(showcase);
            setMdplans(mdplans);
            setPoll(poll);
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

    const latestSize = isMobile ? "96px" : "128px";

    return <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem", width: "100%", height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.25rem", maxWidth: isDesktop ? "min(90%, 1200px)" : "100%" }}>
            <h1 style={{ marginTop: "0.25rem", marginBottom: "0.25rem" }}>Limbus Company Tools</h1>
            <p>
                Welcome, Manager!
                <br /> <br />
                Limbus Company Tools is a hub for sharing team builds and Mirror Dungeon plans. View an Identities and E.G.Os database complete with community ratings and reviews. Use calculators, planners, team randomizers, and other reference tools for the game.
                <br /> <br />
                Use the links below to get started or check out the <NoPrefetchLink className="text-link" href={"/edit-profile"}>Edit Profile</NoPrefetchLink> or <NoPrefetchLink className="text-link" href={"/site-customization"}>Site Customization</NoPrefetchLink> pages to customize your profile or site experience.
                <br /> <br />
                Curious or confused on what you can do on the site? Check out the <NoPrefetchLink className="text-link" href={"/guide"}>Manager&apos;s Guide</NoPrefetchLink> for details on each of the pages and features.
            </p>
            <APR />
            <LinksMenu isMobile={isMobile} />
            <HomepageTimers />
            <CommunityPoll poll={poll} setPoll={setPoll} />
            <RandomTips />
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
                                        <div style={{ display: "flex", gap: "1px" }}>
                                            {list.map(obj => obj.id[0] === "1" ?
                                                (obj.upcoming ?
                                                    <div key={obj.id} style={{ width: latestSize, height: latestSize }}>
                                                        <IdentityIcon identity={obj} uptie={4} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none", borderRadius: "8px" }} />
                                                    </div> :
                                                    <NoPrefetchLink key={obj.id} href={`/identities/${obj.id}`}>
                                                        <div style={{ width: latestSize, height: latestSize }}>
                                                            <IdentityIcon identity={obj} uptie={4} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none", borderRadius: "8px" }} />
                                                        </div>
                                                    </NoPrefetchLink>
                                                ) :
                                                (obj.upcoming ?
                                                    <div key={obj.id} style={{ width: latestSize, height: latestSize }}>
                                                        <EgoIcon ego={obj} type={"awaken"} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none", borderRadius: "8px" }} />
                                                    </div> :
                                                    <NoPrefetchLink key={obj.id} href={`/egos/${obj.id}`}>
                                                        <div style={{ width: latestSize, height: latestSize }}>
                                                            <EgoIcon ego={obj} type={"awaken"} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none", borderRadius: "8px" }} />
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
                    <NoPrefetchLink className="text-link" href={"/release-history"} style={{ alignSelf: "end" }}>
                        Discuss upcoming Identities and E.G.O ➔
                    </NoPrefetchLink>
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
